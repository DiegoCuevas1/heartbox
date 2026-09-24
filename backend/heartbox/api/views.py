import json
import logging
from uuid import UUID

import cloudinary.uploader
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.db.models import Count, Exists, OuterRef, Q
from django.http.response import JsonResponse
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from .models import (
    RELIC_CATEGORIES,
    Category,
    Comment,
    Connection,
    Family,
    Notification,
    Post,
    UserProfile,
)
from .serializers import CommentSerializer, FamilySerializer, UserProfileSerializer
from .utils import is_name_valid

logger = logging.getLogger(__name__)

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 50


############################################################
# Throttles
############################################################

class IPThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}


class AuthThrottle(IPThrottle):
    scope = 'auth'


class PasswordResetThrottle(IPThrottle):
    scope = 'password_reset'


class InviteThrottle(SimpleRateThrottle):
    scope = 'invite'

    def get_cache_key(self, request, view):
        ident = request.user.pk if request.user.is_authenticated else self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}


############################################################
# Helpers
############################################################

def request_data(request):
    """request.data, tolerating clients that send JSON without a content type."""
    if request.data:
        return request.data
    try:
        return json.loads(request.body or b'{}')
    except ValueError:
        return {}


def parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def get_member_family(user, family_id):
    """The family with this id if the user belongs to it, else None."""
    family_id = parse_int(family_id)
    if family_id is None:
        return None
    return Family.objects.filter(id=family_id, members=user).first()


def upload_media(file, media_type, folder):
    """Validate and upload an image or video to Cloudinary. Returns the public_id.

    Raises ValueError with a user-facing message if the file is rejected.
    """
    content_type = (getattr(file, 'content_type', '') or '').lower()
    if media_type == 'IMAGE':
        if not content_type.startswith('image/'):
            raise ValueError('That file is not an image.')
        if file.size > settings.MAX_IMAGE_UPLOAD_BYTES:
            raise ValueError(f'Images must be under {settings.MAX_IMAGE_UPLOAD_BYTES // (1024 * 1024)}MB.')
        options = {
            'resource_type': 'image',
            # Downscale on upload so we never store (or serve) full-size phone photos.
            'transformation': [{'width': 2048, 'height': 2048, 'crop': 'limit', 'quality': 'auto'}],
        }
    elif media_type == 'VIDEO':
        if not content_type.startswith('video/'):
            raise ValueError('That file is not a video.')
        if file.size > settings.MAX_VIDEO_UPLOAD_BYTES:
            raise ValueError(f'Videos must be under {settings.MAX_VIDEO_UPLOAD_BYTES // (1024 * 1024)}MB.')
        options = {'resource_type': 'video'}
    else:
        raise ValueError('Unsupported media type.')

    try:
        result = cloudinary.uploader.upload(file, folder=folder, **options)
    except Exception:
        logger.exception('Cloudinary upload failed')
        raise ValueError('We could not upload that file. Please try again.')
    public_id = result.get('public_id')
    if not public_id:
        raise ValueError('We could not upload that file. Please try again.')
    return public_id


def posts_for(user):
    """Base queryset for posts with everything serialize_post needs, in a fixed number of queries."""
    liked_by_user = Post.likes.through.objects.filter(post_id=OuterRef('pk'), userprofile_id=user.pk)
    return (
        Post.objects.visible_to(user)
        .select_related('user', 'family')
        .prefetch_related('categories')
        .annotate(likes_count=Count('likes', distinct=True), is_liked=Exists(liked_by_user))
        .order_by('-datePosted', '-id')
    )


def paginate(request, queryset):
    """Cursor pagination on id: ?before=<last post id>&limit=<n>."""
    limit = parse_int(request.GET.get('limit')) or DEFAULT_PAGE_SIZE
    limit = max(1, min(limit, MAX_PAGE_SIZE))
    before = parse_int(request.GET.get('before'))
    if before is not None:
        queryset = queryset.filter(id__lt=before)
    return list(queryset[:limit])


def serialize_post(post):
    return {
        'id': post.id,
        'title': post.title,
        'user': post.user_id,
        'message': post.message,
        'datePosted': post.datePosted,
        'likes_count': post.likes_count,
        'is_liked': post.is_liked,
        'user_details': {
            'id': post.user.id,
            'first_name': post.user.first_name,
            'last_name': post.user.last_name,
            'profile_picture': post.user.profile_picture,
        },
        'family_details': {
            'id': post.family.id,
            'family_name': post.family.family_name,
            'family_description': post.family.family_description,
        },
        'media_type': post.media_type,
        'media_url': post.media_url,
        'categories': [{'id': cat.id, 'name': cat.name} for cat in post.categories.all()],
    }


def resolve_category(name):
    """Map a category name or URL slug ("new-year") to a Category, or None."""
    if not name:
        return None
    normalized = name.replace('-', ' ').strip().lower()
    for category_name in RELIC_CATEGORIES:
        if category_name.lower() == normalized:
            category, _ = Category.objects.get_or_create(name=category_name)
            return category
    return None


def can_view_profile(viewer, other):
    if viewer == other:
        return True
    shares_family = Family.objects.filter(members=viewer).filter(members=other).exists()
    if shares_family:
        return True
    return Connection.objects.filter(
        Q(from_user=viewer, to_user=other) | Q(from_user=other, to_user=viewer)
    ).exists()


############################################################
# Auth
############################################################

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def user_login(request):
    data = request_data(request)
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    user = authenticate(request, email=email, password=password)

    if user is None:
        return Response("Email or password incorrect. Try again.", status=status.HTTP_401_UNAUTHORIZED)
    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
    return Response("Login!", status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def user_signup(request):
    data = request_data(request)

    first_name = (data.get('firstName') or '').strip()
    last_name = (data.get('lastName') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    birthdate = data.get('birthDate') or None
    pin = data.get('pin') or None
    profile_pic = request.FILES.get('profilePic')

    if not is_name_valid(first_name):
        return Response("First name was invalid", status=status.HTTP_400_BAD_REQUEST)
    if not is_name_valid(last_name):
        return Response("Last name was invalid", status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_email(email)
    except ValidationError:
        return Response("Invalid email address. Email did not pass email validation", status=status.HTTP_400_BAD_REQUEST)

    User = get_user_model()
    if User.objects.filter(email__iexact=email).exists():
        return Response("Email address already exists in the system", status=status.HTTP_409_CONFLICT)

    try:
        validate_password(password, User(email=email, first_name=first_name, last_name=last_name))
    except ValidationError as e:
        return Response(" ".join(e.messages), status=status.HTTP_400_BAD_REQUEST)

    if pin is not None and not (str(pin).isdigit() and 4 <= len(str(pin)) <= 8):
        return Response("PIN must be 4-8 digits", status=status.HTTP_400_BAD_REQUEST)

    profile_picture = None
    if profile_pic:
        try:
            profile_picture = upload_media(profile_pic, 'IMAGE', 'profile_pictures')
        except ValueError as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    try:
        User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            birthdate=birthdate,
            pin=pin,
            password=password,
            profile_picture=profile_picture,
        )
    except (ValidationError, IntegrityError):
        return Response("Could not create that account. Check your details and try again.",
                        status=status.HTTP_400_BAD_REQUEST)
    return Response("User signup was successful", status=status.HTTP_200_OK)


@api_view(['POST', 'DELETE'])
@permission_classes([AllowAny])
def user_logout(request):
    if not request.user.is_authenticated:
        return Response("You are not logged in!", status.HTTP_400_BAD_REQUEST)
    logout(request)
    return Response("Logged out!", status.HTTP_200_OK)


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def check_login(request):
    """Reports the signed-in user. Also sets the CSRF cookie the frontend echoes back."""
    if not request.user.is_authenticated:
        return Response('Not logged in', status=status.HTTP_200_OK)
    user = request.user
    ret_user = {
        "id": str(user.id),
        "f_name": user.first_name,
        "l_name": user.last_name,
        "profilePic": user.profile_picture,
    }
    return JsonResponse({"data": json.dumps(ret_user), "message": "Logged In"}, status=202)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PasswordResetThrottle])
def forgot_password(request):
    data = request_data(request)
    email = (data.get('email') or '').strip().lower()
    user = UserProfile.objects.filter(email__iexact=email, is_active=True).first()
    if user and user.has_usable_password():
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        link = f"{settings.FRONTEND_URL}/auth/reset-password?uid={uid}&token={token}"
        try:
            send_mail(
                subject="Reset your HeartBox password",
                message=(
                    f"Hi {user.first_name},\n\n"
                    f"Someone asked to reset the password for your HeartBox account. "
                    f"If that was you, open this link to choose a new one:\n\n{link}\n\n"
                    f"If you didn't ask for this, you can ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
        except Exception:
            logger.exception('Failed to send password reset email')
    # Same response either way so this can't be used to discover accounts.
    return Response("If that email has an account, a reset link is on its way.", status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PasswordResetThrottle])
def reset_password(request):
    data = request_data(request)
    try:
        uid = force_str(urlsafe_base64_decode(data.get('uid') or ''))
        user = UserProfile.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, UserProfile.DoesNotExist, ValidationError):
        user = None

    if user is None or not default_token_generator.check_token(user, data.get('token') or ''):
        return Response("This reset link is invalid or has expired.", status=status.HTTP_400_BAD_REQUEST)

    password = data.get('password') or ''
    try:
        validate_password(password, user)
    except ValidationError as e:
        return Response(" ".join(e.messages), status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password)
    user.save(update_fields=['password'])
    return Response("Your password has been reset. You can sign in now.", status=status.HTTP_200_OK)


############################################################
# Families (HeartBoxes)
############################################################

@api_view(['GET', 'POST'])
def family(request):
    if request.method == 'GET':
        family_id = request.GET.get('familyId')
        if family_id:
            found = get_member_family(request.user, family_id)
            if not found:
                return Response('Family Does Not Exist', status=400)
            families = [found]
        else:
            families = request.user.families.all().order_by('family_name')
        serializer = FamilySerializer(families, many=True, context={'request': request})
        return Response(serializer.data, status=200)

    # POST: create a family
    data = request.data
    family_name = (data.get('family_name') or '').strip()
    if not family_name or len(family_name) > 250:
        return Response("Give your HeartBox a name (up to 250 characters).", status=status.HTTP_400_BAD_REQUEST)
    family_description = (data.get('family_description') or '').strip()[:500]

    family_picture = None
    family_pic = request.FILES.get('family_picture')
    if family_pic:
        try:
            family_picture = upload_media(family_pic, 'IMAGE', 'family_pictures')
        except ValueError as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    new_family = Family.objects.create_family(
        family_name=family_name,
        family_description=family_description,
        creator=request.user,
        family_picture=family_picture,
    )
    return Response(new_family.family_name + ' was created successfully.', status=201)


@api_view(['PATCH'])
def update_family(request, family_id):
    """Edit a family's details or rotate its invite code. Creator only."""
    found = get_member_family(request.user, family_id)
    if not found:
        return Response('Family Does Not Exist', status=404)
    if found.creator_id != request.user.pk:
        return Response('Only the HeartBox creator can change its settings.', status=403)

    data = request.data
    if 'family_name' in data:
        name = (data.get('family_name') or '').strip()
        if not name or len(name) > 250:
            return Response("Give your HeartBox a name (up to 250 characters).", status=400)
        found.family_name = name
    if 'family_description' in data:
        found.family_description = (data.get('family_description') or '').strip()[:500]
    family_pic = request.FILES.get('family_picture')
    if family_pic:
        try:
            found.family_picture = upload_media(family_pic, 'IMAGE', 'family_pictures')
        except ValueError as e:
            return Response(str(e), status=400)
    found.save()

    if str(data.get('regenerate_invite_code', '')).lower() in ('1', 'true'):
        found.regenerate_invite_code()

    return Response(FamilySerializer(found, context={'request': request}).data, status=200)


@api_view(['POST'])
def remove_family_member(request, family_id):
    """Remove someone from a family. Creator only."""
    found = get_member_family(request.user, family_id)
    if not found:
        return Response('Family Does Not Exist', status=404)
    if found.creator_id != request.user.pk:
        return Response('Only the HeartBox creator can remove members.', status=403)

    user_id = request.data.get('userId')
    if str(user_id) == str(request.user.pk):
        return Response('Use "Leave" to leave your own HeartBox.', status=400)
    try:
        member = found.members.get(pk=user_id)
    except (UserProfile.DoesNotExist, ValidationError, ValueError):
        return Response('That person is not in this HeartBox.', status=404)
    found.members.remove(member)
    return Response(f'{member.first_name} was removed.', status=200)


@api_view(['GET'])
def getMembersOfFamily(request):
    family_id = request.GET.get('familyId')
    if not family_id:
        return Response('Family ID is required', status=400)
    found = get_member_family(request.user, family_id)
    if not found:
        return Response('Family Does Not Exist', status=400)
    members = found.members.exclude(pk=request.user.pk)
    return Response(UserProfileSerializer(members, many=True, context={'request': request}).data, status=200)


@api_view(['POST'])
@throttle_classes([InviteThrottle])
def join_family(request):
    data = request_data(request)
    code = (data.get('inviteCode') or '').strip().upper()
    found = Family.objects.filter(invite_code__iexact=code).first() if code else None
    if not found:
        return Response('Invalid invite code.', status=400)

    user = request.user
    if found.is_member(user):
        return Response('Already in that Family', status=400)
    found.members.add(user)

    Notification.objects.bulk_create([
        Notification(notification_type='GROUP_JOIN', sender=user, recipient=member, family_joined=found)
        for member in found.members.exclude(pk=user.pk)
    ])
    return Response('Successfully joined the family!', status=200)


@api_view(['PATCH', 'POST'])
def leave_family(request):
    data = request_data(request)
    found = get_member_family(request.user, data.get('familyId'))
    if not found:
        return Response('You are not a member of this family.', status=400)

    with transaction.atomic():
        found.members.remove(request.user)
        if found.creator_id == request.user.pk:
            # Hand ownership to the longest-standing remaining member.
            next_owner = found.members.order_by('date_joined').first()
            found.creator = next_owner
            found.save(update_fields=['creator'])
    return Response('Successfully left the family.', status=200)


############################################################
# Posts (Relics)
############################################################

@api_view(['POST', 'DELETE'])
def like_post(request, post_id):
    post = Post.objects.visible_to(request.user).filter(id=post_id).select_related('user').first()
    if not post:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    user = request.user
    already_liked = post.likes.filter(pk=user.pk).exists()

    if request.method == 'POST':
        if already_liked:
            return Response({'message': 'Post already liked'}, status=status.HTTP_400_BAD_REQUEST)
        post.likes.add(user)
        if post.user_id != user.pk:
            Notification.objects.create_notif('LIKE', user, post.user, post_mentioned=post)
        return Response({'message': 'Post liked successfully'}, status=status.HTTP_200_OK)

    if not already_liked:
        return Response({'message': 'Post not liked'}, status=status.HTTP_400_BAD_REQUEST)
    post.likes.remove(user)
    Notification.objects.filter(
        notification_type='LIKE', sender=user, recipient_id=post.user_id, post_mentioned=post
    ).delete()
    return Response({'message': 'Post unliked successfully'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def post(request, category=None):
    if request.method == 'GET':
        queryset = posts_for(request.user)

        if category is not None:
            category_obj = resolve_category(category)
            if not category_obj:
                return Response([], status=200)
            return Response([serialize_post(p) for p in paginate(request, queryset.filter(categories=category_obj))])

        post_id = request.GET.get('postId')
        if post_id:
            found = queryset.filter(id=parse_int(post_id)).first() if parse_int(post_id) else None
            if not found:
                return Response("Post not found", status=404)
            return Response(serialize_post(found), status=200)

        family_id = request.GET.get('familyId')
        if family_id:
            found_family = get_member_family(request.user, family_id)
            if not found_family:
                return Response("User is not a member of this family", status=status.HTTP_403_FORBIDDEN)
            queryset = queryset.filter(family=found_family)

        user_id = request.GET.get('userId')
        if user_id:
            try:
                UUID(user_id)
            except ValueError:
                return Response("User not found", status=404)
            # Only relics from HeartBoxes the viewer shares with this person.
            queryset = queryset.filter(user_id=user_id)

        # With no filter: every relic from every HeartBox the user belongs to.
        return Response([serialize_post(p) for p in paginate(request, queryset)], status=200)

    # POST: create a relic
    data = request.data
    target_family = get_member_family(request.user, data.get('familyId'))
    if not target_family:
        return Response('Pick a HeartBox you belong to.', status=status.HTTP_400_BAD_REQUEST)

    title = (data.get('title') or '').strip()
    if not title or len(title) > 200:
        return Response('Give your relic a title (up to 200 characters).', status=status.HTTP_400_BAD_REQUEST)
    message = (data.get('description') or '').strip()

    media_file = request.FILES.get('media')
    media_type = data.get('media_type') if media_file else None
    media_url = None
    if media_file:
        try:
            media_url = upload_media(media_file, media_type, 'post_media')
        except ValueError as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    category_obj = resolve_category(data.get('category'))
    Post.objects.create_post(
        title=title,
        message=message,
        user=request.user,
        family=target_family,
        media_type=media_type,
        media_url=media_url,
        categories=[category_obj] if category_obj else None,
    )
    return Response('Your relic was successfully created', status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
def post_detail(request, post_id):
    """Edit (author only) or delete (author or HeartBox creator) a relic."""
    found = Post.objects.visible_to(request.user).filter(id=post_id).select_related('family').first()
    if not found:
        return Response("Post not found", status=404)

    is_author = found.user_id == request.user.pk
    if request.method == 'DELETE':
        if not (is_author or found.family.creator_id == request.user.pk):
            return Response("You can't delete this relic.", status=403)
        found.delete()
        return Response("Relic deleted.", status=200)

    if not is_author:
        return Response("Only the author can edit this relic.", status=403)
    data = request.data
    if 'title' in data:
        title = (data.get('title') or '').strip()
        if not title or len(title) > 200:
            return Response('Give your relic a title (up to 200 characters).', status=400)
        found.title = title
    if 'description' in data:
        found.message = (data.get('description') or '').strip()
    found.save()
    if 'category' in data:
        category_obj = resolve_category(data.get('category'))
        found.categories.set([category_obj] if category_obj else [])
    return Response(serialize_post(posts_for(request.user).get(id=found.id)), status=200)


@api_view(['GET'])
def categories(request):
    for name in RELIC_CATEGORIES:
        Category.objects.get_or_create(name=name)
    ordered = {name: i for i, name in enumerate(RELIC_CATEGORIES)}
    cats = sorted(Category.objects.filter(name__in=RELIC_CATEGORIES), key=lambda c: ordered[c.name])
    return Response([{'id': c.id, 'name': c.name} for c in cats], status=200)


############################################################
# Users & search
############################################################

@api_view(['GET'])
def get_user_details(request):
    user_id = request.GET.get('userId')
    if not user_id:
        return Response({"error": "userId query parameter is required"}, status=400)
    try:
        UUID(user_id)
    except ValueError:
        return Response({"error": "Invalid userId format"}, status=400)

    user = UserProfile.objects.filter(id=user_id).first()
    if not user or not can_view_profile(request.user, user):
        return Response({"error": "User not found"}, status=404)
    return Response(UserProfileSerializer(user, context={'request': request}).data, status=200)


@api_view(['GET'])
def search(request):
    """Search people you share a HeartBox or connection with, your HeartBoxes, and relics you can see."""
    q = (request.GET.get('q') or '').strip()
    if len(q) < 2:
        return Response({'people': [], 'families': [], 'relics': []})

    me = request.user
    name_match = Q(first_name__icontains=q) | Q(last_name__icontains=q)
    if ' ' in q:
        first, _, last = q.partition(' ')
        name_match |= Q(first_name__icontains=first, last_name__icontains=last.strip())
    connected_ids = Connection.objects.filter(Q(from_user=me) | Q(to_user=me)).values_list('from_user', 'to_user')
    related_ids = {uid for pair in connected_ids for uid in pair}
    people = (
        UserProfile.objects.filter(name_match)
        .filter(Q(families__members=me) | Q(id__in=related_ids))
        .exclude(pk=me.pk)
        .distinct()[:10]
    )
    families = me.families.filter(family_name__icontains=q)[:10]
    relics = posts_for(me).filter(Q(title__icontains=q) | Q(message__icontains=q))[:20]

    return Response({
        'people': [
            {'id': str(p.id), 'first_name': p.first_name, 'last_name': p.last_name, 'profile_picture': p.profile_picture}
            for p in people
        ],
        'families': [
            {'id': f.id, 'family_name': f.family_name, 'family_picture': f.family_picture} for f in families
        ],
        'relics': [serialize_post(p) for p in relics],
    })


############################################################
# Notifications
############################################################

def serialize_notification(notification):
    family_details = None
    if notification.family_joined_id:
        family_details = {
            'id': notification.family_joined.id,
            'family_name': notification.family_joined.family_name,
            'family_picture': notification.family_joined.family_picture,
        }
    return {
        'id': notification.id,
        'notification_type': notification.notification_type,
        'timestamp': notification.timestamp,
        'sender_details': {
            'id': notification.sender.id,
            'first_name': notification.sender.first_name,
            'last_name': notification.sender.last_name,
            'profile_picture': notification.sender.profile_picture,
        },
        'family_details': family_details,
        'connection_id': str(notification.connection_id) if notification.connection_id else None,
        'comment_message': notification.comment.message if notification.comment_id else None,
        'post_id': notification.post_mentioned_id,
        'read': notification.read,
    }


@api_view(['GET'])
def notification(request):
    queryset = (
        Notification.objects.filter(recipient=request.user)
        .select_related('sender', 'family_joined', 'comment')
        .order_by('-timestamp')
    )

    notification_id = request.GET.get('notificationId')
    if notification_id:
        found = queryset.filter(id=parse_int(notification_id)).first() if parse_int(notification_id) else None
        if not found:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serialize_notification(found), status=status.HTTP_200_OK)

    if request.GET.get('unread_only', 'false').lower() == 'true':
        queryset = queryset.filter(read=False)
    limit = min(parse_int(request.GET.get('limit')) or MAX_PAGE_SIZE, 100)
    return Response([serialize_notification(n) for n in queryset[:limit]], status=status.HTTP_200_OK)


@api_view(['GET'])
def notification_count(request):
    count = Notification.objects.filter(recipient=request.user, read=False).count()
    return Response({'count': count}, status=status.HTTP_200_OK)


@api_view(['POST'])
def mark_notification_read(request, notification_id):
    updated = Notification.objects.filter(id=notification_id, recipient=request.user).update(read=True)
    if not updated:
        return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
def mark_all_notifications_read(request):
    Notification.objects.filter(recipient=request.user, read=False).update(read=True)
    return Response({"message": "All notifications marked as read"}, status=status.HTTP_200_OK)


############################################################
# Connections
############################################################

@api_view(['GET'])
def connections(request):
    user = request.user
    accepted = Connection.objects.filter(Q(from_user=user) | Q(to_user=user), status='ACCEPTED')
    other_ids = {c.to_user_id if c.from_user_id == user.pk else c.from_user_id for c in accepted}
    connected_users = UserProfile.objects.filter(id__in=other_ids)
    serializer = UserProfileSerializer(connected_users, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def send_connection_request(request):
    to_user_id = request.data.get('userId')
    if not to_user_id:
        return Response({"error": "userId is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        to_user = UserProfile.objects.get(id=to_user_id)
    except (UserProfile.DoesNotExist, ValidationError, ValueError):
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    if to_user == request.user:
        return Response({"message": "You can't connect with yourself."}, status=status.HTTP_400_BAD_REQUEST)
    if not can_view_profile(request.user, to_user):
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    reverse = Connection.objects.filter(from_user=to_user, to_user=request.user).first()
    if reverse and reverse.status in ('PENDING', 'ACCEPTED'):
        message = ("You are already connected." if reverse.status == 'ACCEPTED'
                   else "They already sent you a request. Accept it from your notifications.")
        return Response({"message": message}, status=status.HTTP_400_BAD_REQUEST)

    connection = Connection.objects.filter(from_user=request.user, to_user=to_user).first()
    if connection:
        if connection.status == 'PENDING':
            return Response({"message": "Connection request already sent."}, status=status.HTTP_400_BAD_REQUEST)
        if connection.status == 'ACCEPTED':
            return Response({"message": "You are already connected."}, status=status.HTTP_400_BAD_REQUEST)
        # Previously declined: ask again.
        connection.status = 'PENDING'
        connection.save(update_fields=['status', 'updated_at'])
    else:
        connection = Connection.objects.create(from_user=request.user, to_user=to_user, status='PENDING')

    Notification.objects.create_notif('CONNECTION_REQUEST', request.user, to_user, connection=connection)
    return Response({"message": "Connection request sent."}, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
def respond_to_connection_request(request):
    data = request.data
    connection_id = data.get('connectionId')
    action = data.get('action')
    notification_id = data.get('notificationId')

    if not connection_id or not action:
        return Response({"error": "connectionId and action are required"}, status=status.HTTP_400_BAD_REQUEST)

    connection = Connection.objects.filter(id=parse_int(connection_id)).first() if parse_int(connection_id) else None
    if not connection:
        return Response({"error": "Connection not found"}, status=status.HTTP_404_NOT_FOUND)
    if connection.to_user_id != request.user.pk:
        return Response({"error": "You are not authorized to respond to this connection request."},
                        status=status.HTTP_403_FORBIDDEN)
    if connection.status != 'PENDING':
        return Response({"error": "This request was already answered."}, status=status.HTTP_400_BAD_REQUEST)

    if action not in ('accept', 'decline'):
        return Response({"error": "Invalid action. Use 'accept' or 'decline'."}, status=status.HTTP_400_BAD_REQUEST)

    Notification.objects.filter(
        recipient=request.user, notification_type='CONNECTION_REQUEST', connection=connection
    ).delete()
    if notification_id:
        Notification.objects.filter(id=parse_int(notification_id), recipient=request.user).delete()

    if action == 'accept':
        connection.accept()
        Notification.objects.create_connection_accepted_notification(sender=connection.from_user, recipient=connection.to_user)
        Notification.objects.create_connection_accepted_notification(sender=connection.to_user, recipient=connection.from_user)
        return Response({"message": "Connection request accepted and notifications sent."}, status=status.HTTP_200_OK)

    connection.decline()
    return Response({"message": "Connection request declined."}, status=status.HTTP_200_OK)


@api_view(['POST'])
def cancel_connection_request(request):
    to_user_id = request.data.get('userId')
    if not to_user_id:
        return Response({"error": "userId is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        existing = Connection.objects.filter(from_user=request.user, to_user_id=to_user_id, status='PENDING').first()
    except (ValidationError, ValueError):
        existing = None
    if not existing:
        return Response({"error": "No pending connection request found."}, status=status.HTTP_404_NOT_FOUND)

    Notification.objects.filter(connection=existing, notification_type='CONNECTION_REQUEST').delete()
    existing.delete()
    return Response({"message": "Connection request canceled and notification deleted."}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def remove_connection(request):
    user_id = request.data.get('userId')
    if not user_id:
        return Response({"error": "userId is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        other_user = UserProfile.objects.get(id=user_id)
    except (UserProfile.DoesNotExist, ValidationError, ValueError):
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    connection = Connection.objects.filter(
        Q(from_user=request.user, to_user=other_user) | Q(from_user=other_user, to_user=request.user),
        status='ACCEPTED'
    ).first()
    if not connection:
        return Response({"error": "No active connection found."}, status=status.HTTP_404_NOT_FOUND)

    Notification.objects.filter(
        Q(sender=request.user, recipient=other_user) | Q(sender=other_user, recipient=request.user),
        notification_type__in=['CONNECTION_REQUEST', 'CONNECTION_ACCEPTED']
    ).delete()
    connection.delete()
    return Response({"message": "Connection removed successfully."}, status=status.HTTP_200_OK)


############################################################
# Comments
############################################################

@api_view(['GET', 'POST', 'DELETE'])
def comments(request):
    if request.method == 'GET':
        post_id = parse_int(request.GET.get('postId'))
        if not post_id:
            return Response("Post ID is required", status=400)
        found = Post.objects.visible_to(request.user).filter(id=post_id).first()
        if not found:
            return Response("Post not found", status=404)
        top_level = (
            found.comments.filter(parent=None)
            .select_related('user')
            .prefetch_related('replies__user', 'replies__parent__user')
        )
        return Response(CommentSerializer(top_level, many=True).data, status=200)

    if request.method == 'DELETE':
        comment_id = parse_int(request.GET.get('commentId') or request.data.get('commentId'))
        found = Comment.objects.filter(id=comment_id, post__family__members=request.user).select_related('post').first() \
            if comment_id else None
        if not found:
            return Response("Comment not found", status=404)
        if found.user_id != request.user.pk and found.post.user_id != request.user.pk:
            return Response("You can't delete this comment.", status=403)
        found.delete()
        return Response("Comment deleted.", status=200)

    # POST
    data = request.data
    message = (data.get('message') or '').strip()
    post_id = parse_int(data.get('postId'))
    if not post_id or not message:
        return Response("Post ID and message are required", status=400)
    if len(message) > 5000:
        return Response("Comments can be up to 5000 characters.", status=400)

    found = Post.objects.visible_to(request.user).filter(id=post_id).select_related('user').first()
    if not found:
        return Response("Post not found", status=404)

    parent_comment = None
    parent_id = data.get('parentId')
    if parent_id:
        parent_comment = Comment.objects.filter(id=parse_int(parent_id), post=found).select_related('user').first()
        if not parent_comment:
            return Response("Parent comment not found", status=404)

    comment = Comment.objects.create_comment(message=message, user=request.user, post=found, parent=parent_comment)

    # Notify the person being replied to, and the relic's author, once each (never yourself).
    recipients = []
    if parent_comment:
        recipients.append(parent_comment.user)
    recipients.append(found.user)
    notified = set()
    for recipient in recipients:
        if recipient.pk != request.user.pk and recipient.pk not in notified:
            notified.add(recipient.pk)
            Notification.objects.create_notif('COMMENT', request.user, recipient, post_mentioned=found, comment=comment)

    return Response(CommentSerializer(comment).data, status=201)
