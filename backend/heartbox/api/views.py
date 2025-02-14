from datetime import datetime
import json
import os
from uuid import UUID
import uuid
from botocore.exceptions import ClientError
import cloudinary
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http.response import JsonResponse
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import pytz
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view,authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q  # make sure you import Q if you use it

from website import settings

from .models import Family, Notification, UserProfile, Post, Connection, Comment, Category
from .serializers import FamilySerializer, NotificationSerializer, UserProfileSerializer, PostSerializer, CommentSerializer
from .utils import is_name_valid



@api_view(['POST'])
def user_login(request):
    if request.method=='POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        user = authenticate(email=email, password=password)
        
        if user is not None:
            login(request, user)
            request.session['email'] = email
            return Response("Login!", status=status.HTTP_202_ACCEPTED)
        else:
            return Response("Email or password incorrect. Try again.", status=status.HTTP_401_UNAUTHORIZED)
        

        
@api_view(['POST'])
def user_signup(request):
    if request.method == 'POST':
        
        data = request.data
    
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        password = data.get('password')
        birthdate = data.get('birthDate')
        pin = data.get('pin')
        profile_pic = request.FILES.get('profilePic')
        if not is_name_valid(first_name):
            return Response("First name was invalid", status=status.HTTP_400_BAD_REQUEST)
        if not is_name_valid(last_name):
            return Response("Last name was invalid", status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_email(email)
        except ValidationError as e:
            return Response("Invalid email address. Email did not pass email validation", status=status.HTTP_400_BAD_REQUEST)
        
       
        
        db = get_user_model()
        if db.objects.filter(email = email).exists():
            return Response("Email address already exists in the system", status=status.HTTP_409_CONFLICT)
        
        

        try:
            validate_password(password)
        except ValidationError as e:
            return Response("Password did not pass password validation", status=status.HTTP_400_BAD_REQUEST)


        
        cloudinary_url = None
        if profile_pic:
            try:
                upload_result = cloudinary.uploader.upload(profile_pic)
                cloudinary_url = upload_result.get('public_id')
            except Exception as e:
                return Response(f"Error uploading image to Cloudinary: {str(e)}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user = db.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            birthdate=birthdate,
            pin=pin,
            password=password,
            profile_picture=cloudinary_url # Assign unique filename if profile pic exists
        )
        user.save()
        return Response("User signup was successful", status=status.HTTP_200_OK)

@api_view(['DELETE'])
def user_logout(request):
    if 'email' not in request.session:
        return Response("You are not logged in!", status.HTTP_400_BAD_REQUEST)
    
    logout(request)
    return Response("Logged out!", status.HTTP_200_OK)

@api_view(['GET'])
def check_login(request):
    if 'email' not in request.session:
        return Response('Not logged in', status=status.HTTP_200_OK)
    else:
        try:
            email = request.session['email']
            logged_in_user = UserProfile.objects.get(email = email)
            ret_user = {
                "id": str(logged_in_user.id),
                "f_name": logged_in_user.first_name,
                "l_name": logged_in_user.last_name,
                "profilePic": logged_in_user.profile_picture
            }
            return JsonResponse({"data": json.dumps(ret_user), "message": "Logged In"}, status=202)
        except UserProfile.DoesNotExist:
            return JsonResponse({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
        except Exception as e:
            return JsonResponse({"message": "Error loading logged in user data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['GET','POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def family(request):
    if request.method == 'GET':
        family_id = request.GET.get('familyId')
        if family_id:
            # If familyId is provided, filter the families based on the ID
            try:
                user_families = Family.objects.filter(id=family_id, members=request.user)
                serializer = FamilySerializer(user_families, many=True, context={'request': request})
                if serializer.data == []:
                    return Response('Family Does Not Exist', status=400)
                return Response(serializer.data, status=200)

            except ValueError:
                return Response("Invalid familyId format", status=400)
        else:
            user_families = request.user.families.all()

        serializer = FamilySerializer(user_families, many=True, context={'request': request})
        
        return Response(serializer.data, status=200)
    
    if request.method == 'POST':
        family_pic = request.FILES.get('family_picture')
        
        if family_pic:  # Check if an image was provided in the request
            try:
                uploaded_image = cloudinary.uploader.upload(family_pic,folder='family_pictures')  # Upload image to Cloudinary
                unique_filename = uploaded_image.get('public_id')  # Retrieve the URL of the uploaded image
                if not unique_filename:
                    return Response("Failed to get image URL", status=status.HTTP_400_BAD_REQUEST)
            except cloudinary.exceptions.Error as e:
                return Response(f"Cloudinary upload failed: {str(e)}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            unique_filename = None
        family = Family.objects.create_family(
            family_name=request.data['family_name'],
            family_description=request.data['family_description'],
            creator = request.user,
            family_picture= unique_filename if family_pic else 'family_pictures/families'
        )
        # Add the current user to the family members
        request.user.add_to_family(family)
        family.members.add(request.user)
            
        return Response(family.family_name + ' was created successfully.', status=201)

    return Response(serializer.errors, status=400)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def getMembersOfFamily(request):
    if request.method == 'GET':
        family_id = request.GET.get('familyId')
        if family_id:
            # If familyId is provided, filter the families based on the ID
            try:
                user_family = Family.objects.get(id=family_id, members=request.user)
                # Use the FamilySerializer to include members
                serializer = FamilySerializer(user_family, context={'request': request})
                
                # Access the members directly from the serialized data
                members = serializer.data.get('members')
                
                if not members:
                    return Response('Family Does Not Exist', status=400)
                
                return Response(members, status=200)
            
            except Family.DoesNotExist:
                return Response('Family Does Not Exist', status=400)
            except ValueError:
                return Response("Invalid familyId format", status=400)
        
        return Response('Family ID is required', status=400)

@api_view(['POST'])
@authentication_classes([SessionAuthentication,BasicAuthentication])
@permission_classes([IsAuthenticated])
def join_family(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        family = Family.objects.filter(invite_code=data.get('inviteCode')).first()
        if family:
            user = request.user 
            if user in family.members.all():
                return Response('Already in that Family',status=400)
            user.add_to_family(family)
            family.members.add(user)
            
            for member in family.members.exclude(pk=user.pk):
                    Notification.objects.create_group_join_notification(
                        sender=user,
                        recipient=member,
                        family_joined=family
                    )
            return Response('Successfully joined the family!',status=200)

        return Response('Invalid invite code.',status=400)

    return Response('Invalid request method.',status=405)

@api_view(['PATCH'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def leave_family(request):
    if request.method == 'PATCH':
        user = request.user
        data = json.loads(request.body)
        family_id = data.get('familyId')
        try:
            family = Family.objects.get(id=int(family_id))
        except Family.DoesNotExist:
            return Response('Family does not exist.', status=400)

        if user in family.members.all():
            # Remove user from the family
            user.remove_from_family(family)
            family.members.remove(user)
            
            return Response('Successfully left the family.', status=200)
        else:
            return Response('You are not a member of this family.', status=400)
        
    return Response('Invalid request method.', status=405)


@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def post(request, category=None):
    if request.method == 'GET':
        user_id = request.GET.get('userId')
        post_id = request.GET.get('postId')
        family_id = request.GET.get('familyId')

        if category:
            # Filter posts by category name
            try:
                category_obj = Category.objects.get(name__iexact=category)
                posts = Post.objects.filter(categories=category_obj).order_by('-datePosted')
                serialized_posts = []
                for post in posts:
                    post_serialized = PostSerializer(post)
                    family = Family.objects.get(id=post_serialized.data['family'])
                    serialized_family = FamilySerializer(family, context={'request': request})
                    user_details = {
                        'id': post.user.id,
                        'first_name': post.user.first_name,
                        'last_name': post.user.last_name,
                        'profile_picture': post.user.profile_picture,
                    }
                    family_details = {
                        'id': serialized_family.data['id'],
                        'family_name': serialized_family.data['family_name'],
                        'family_description': serialized_family.data['family_description'],
                    }
                    post_data = {
                        'id': post_serialized.data['id'],
                        'title': post_serialized.data['title'],
                        'user': post_serialized.data['user'],
                        'message': post_serialized.data['message'],
                        'datePosted': post_serialized.data['datePosted'],
                        'family_details': family_details,
                        'user_details': user_details,
                        'media_type': post_serialized.data.get('media_type'),
                        'media_url': post_serialized.data.get('media_url'),
                        'categories': [{'id': cat.id, 'name': cat.name} for cat in post.categories.all()]
                    }
                    serialized_posts.append(post_data)
                return Response(serialized_posts, status=200)
            except Category.DoesNotExist:
                return Response([], status=200)

        if post_id:
            if Post.objects.filter(id=post_id).exists():
                post = Post.objects.get(id=post_id)
                post_serialized = PostSerializer(post)
                family = Family.objects.get(id=post_serialized.data['family'])
                serialized_family = FamilySerializer(family,context={'request': request})
                family_details = {
                    'id':serialized_family.data['id'],
                    'family_name':serialized_family.data['family_name'],
                    'family_description':serialized_family.data['family_description'],
                }
                serializer_data = {
                    'user_details':{
                        'id':post.user.id,
                        'first_name': post.user.first_name,
                        'last_name': post.user.last_name,
                        'profile_picture':post.user.profile_picture,
                    },
                    'id': post_serialized.data['id'],
                    'title': post_serialized.data['title'],
                    'user': post_serialized.data['user'],
                    'message': post_serialized.data['message'],
                    'datePosted': post_serialized.data['datePosted'],
                    'family_details':family_details,
                    'media_type': post_serialized.data.get('media_type'),
                    'media_url': post_serialized.data.get('media_url'),
                    'categories': [{'id': cat.id, 'name': cat.name} for cat in post.categories.all()]
                }
                return Response(serializer_data, status=200)
            else:
                return Response("Post does not exist", status=404)
            
        if family_id:
            try:
                family = Family.objects.get(id=family_id)
                if request.user in family.members.all():
                    posts = Post.objects.get_posts_in_family(family).order_by('-datePosted')
                    # Serialize posts along with user details
                    serialized_posts = []
                    for post in posts:
                        post_serialized = PostSerializer(post)
                        family = Family.objects.get(id=post_serialized.data['family'])
                        serialized_family = FamilySerializer(family,context={'request': request})
                        user_details = {
                            'id': post.user.id,
                            'first_name': post.user.first_name,
                            'last_name': post.user.last_name,
                            'profile_picture':post.user.profile_picture,
                            # Add other user details as needed
                        }
                        family_details = {
                            'id':serialized_family.data['id'],
                            'family_name':serialized_family.data['family_name'],
                            'family_description':serialized_family.data['family_description'],
                        }
                        post_data = {
                            'id': post_serialized.data['id'],
                            'title': post_serialized.data['title'],
                            'user': post_serialized.data['user'],
                            'message': post_serialized.data['message'],
                            'datePosted': post_serialized.data['datePosted'],
                            'family_details':family_details,
                            'user_details': user_details,
                            'media_type': post_serialized.data.get('media_type'),
                            'media_url': post_serialized.data.get('media_url'),
                            'categories': [{'id': cat.id, 'name': cat.name} for cat in post.categories.all()]
                        }
                        serialized_posts.append(post_data)

                    return Response(serialized_posts, status=200)
                else:
                    return Response("User is not a member of this family", status=status.HTTP_403_FORBIDDEN)
            except Family.DoesNotExist:
                return Response("Family not found", status=404)
        if user_id:
            try:
                # Validate if the provided user_id is a valid UUID
                UUID(user_id)
            except ValueError:
                raise ValidationError("Invalid userId format")

            try:
                # Fetch the user by UUID
                user = UserProfile.objects.get(id=user_id)
                posts = Post.objects.filter(user=user).order_by('-datePosted')
                serialized_posts = []
                for post in posts:
                    post_serialized = PostSerializer(post)
                    family = Family.objects.get(id=post_serialized.data['family'])
                    serialized_family = FamilySerializer(family, context={'request': request})
                    user_details = {
                        'id': post.user.id,
                        'first_name': post.user.first_name,
                        'last_name': post.user.last_name,
                        'profile_picture': post.user.profile_picture,
                    }
                    family_details = {
                        'id': serialized_family.data['id'],
                        'family_name': serialized_family.data['family_name'],
                        'family_description': serialized_family.data['family_description'],
                    }
                    post_data = {
                        'id': post_serialized.data['id'],
                        'title': post_serialized.data['title'],
                        'user': post_serialized.data['user'],
                        'message': post_serialized.data['message'],
                        'datePosted': post_serialized.data['datePosted'],
                        'family_details': family_details,
                        'user_details': user_details,
                        'media_type': post_serialized.data.get('media_type'),
                        'media_url': post_serialized.data.get('media_url'),
                        'categories': [{'id': cat.id, 'name': cat.name} for cat in post.categories.all()]
                    }
                    serialized_posts.append(post_data)

                return Response(serialized_posts, status=200)

            except UserProfile.DoesNotExist:
                return Response("User not found", status=404)
            
        
        user = UserProfile.objects.get(id=request.user.id)
        families = user.families.all()
        family_ids = [family.id for family in families]

        posts = Post.objects.filter(family__id__in=family_ids).order_by('-datePosted')
        serialized_posts = []
        for post in posts:
            post_serialized = PostSerializer(post)
            family = Family.objects.get(id=post_serialized.data['family'])
            serialized_family = FamilySerializer(family,context={'request': request})
            user_details = {
                'id': post.user.id,
                'first_name': post.user.first_name,
                'last_name': post.user.last_name,
                'profile_picture':post.user.profile_picture,
                # Add other user details as needed
            }
            family_details = {
                'id':serialized_family.data['id'],
                'family_name':serialized_family.data['family_name'],
                'family_description':serialized_family.data['family_description'],
            }
            post_data = {
                'id': post_serialized.data['id'],
                'title': post_serialized.data['title'],
                'user': post_serialized.data['user'],
                'message': post_serialized.data['message'],
                'datePosted': post_serialized.data['datePosted'],
                'family_details':family_details,
                'user_details': user_details,
                'media_type': post_serialized.data.get('media_type'),
                'media_url': post_serialized.data.get('media_url'),
                'categories': [{'id': cat.id, 'name': cat.name} for cat in post.categories.all()]
            }
            serialized_posts.append(post_data)

        return Response(serialized_posts,200)


    if request.method == 'POST':
        try:
            user_profile = UserProfile.objects.get(id=request.user.id)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create a mutable copy of the data
        data = request.data.copy()
        data['user'] = request.user.id
        
        converted_tz = pytz.timezone('US/Eastern')
        data['datePosted'] = datetime.now(converted_tz)

        # Handle media upload
        media_file = request.FILES.get('media')
        media_type = data.get('media_type')
        media_url = None

        if media_file and media_type:
            try:
                upload_options = {
                    'folder': 'post_media',
                    'resource_type': 'auto'
                }
                
                upload_result = cloudinary.uploader.upload(media_file, **upload_options)
                media_url = upload_result.get('public_id')
                
                if not media_url:
                    return Response("Failed to upload media", status=status.HTTP_400_BAD_REQUEST)
                
            except Exception as e:
                return Response(f"Error uploading media: {str(e)}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Handle categories
        category_name = data.get('category')
        categories = None
        if category_name and category_name.lower() != 'none':
            # Get or create the category
            category, created = Category.objects.get_or_create(
                name=category_name,
                defaults={'description': f'Category for {category_name} posts'}
            )
            categories = [category]

        serializer = PostSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            try:
                family = get_object_or_404(Family, id=data['familyId'])
            except Family.DoesNotExist:
                return Response({'error': 'Family does not exist'}, status=status.HTTP_404_NOT_FOUND)

            post = Post.objects.create_post(
                title=data.get('title'),
                message=data.get('description'),
                user=UserProfile.objects.get(id=request.user.id),
                family=Family.objects.get(id=data['familyId']),
                date_posted=data['datePosted'],
                media_type=media_type,
                media_url=media_url,
                categories=categories
            )
            return Response('Your post was successfully created', status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    return Response('Invalid Method Request', status=status.HTTP_403_FORBIDDEN)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    user_id = request.GET.get('userId')  # Extract userId from query parameters
    
    if not user_id:
        return Response({"error": "userId query parameter is required"}, status=400)

    try:
        # Validate if the provided user_id is a valid UUID
        UUID(user_id)
    except ValueError:
        return Response({"error": "Invalid userId format"}, status=400)

    try:
        # Fetch the user by UUID
        user = UserProfile.objects.get(id=user_id)
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data, status=200)
    except UserProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def notification(request):
    if request.method == 'GET':
        notificationId = request.GET.get('notificationId')
        unread_only = request.GET.get('unread_only', 'false').lower() == 'true'

        if notificationId:  # Check if notificationId is provided
            try:
                notification = Notification.objects.get(id=notificationId)
                serializer = NotificationSerializer(notification)
                family = Family.objects.get(id=serializer.data['family_joined'])
                family_details = {
                    'id':family.id,
                    'family_name':family.family_name,
                    'family_picture':family.family_picture
                }
                user_details = {
                    'id': notification.sender.id,
                    'first_name': notification.sender.first_name,
                    'last_name': notification.sender.last_name,
                    'profile_picture': notification.sender.profile_picture,  
                }
                notification_details = {
                    'sender_details': user_details,
                    'id': serializer.data['id'],
                    'notification_type': serializer.data['notification_type'],
                    'timestamp': serializer.data['timestamp'],
                    'family_details':family_details,
                    'connection_id': str(notification.connection.id) if notification.connection else None,
                    'comment_message': notification.comment.message if notification.comment else None,
                    'post_id': notification.post_mentioned.id if notification.post_mentioned else None
                }
                return Response(notification_details, status=status.HTTP_200_OK)
            except Notification.DoesNotExist:
                return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get notifications for the user
        notifications_query = Notification.objects.filter(recipient_id=request.user.id)
        if unread_only:
            notifications_query = notifications_query.filter(read=False)
        
        notifications = notifications_query.order_by('-timestamp')
        serialized_notifications = []
        for notification in notifications:
            serializer = NotificationSerializer(notification)
            family_details = None
            if serializer.data['family_joined']:
                family = Family.objects.get(id=serializer.data['family_joined'])
                family_details = {
                    'id': family.id,
                    'family_name': family.family_name,
                    'family_picture': family.family_picture
                }
            sender_details = {
                'id': notification.sender.id,
                'first_name': notification.sender.first_name,
                'last_name': notification.sender.last_name,
                'profile_picture': notification.sender.profile_picture,  
            }
            notification_details = {
                'id': serializer.data['id'],
                'notification_type': serializer.data['notification_type'],
                'timestamp': serializer.data['timestamp'],
                'sender_details': sender_details,
                'family_details': family_details,
                'connection_id': str(notification.connection.id) if notification.connection else None,
                'comment_message': notification.comment.message if notification.comment else None,
                'post_id': notification.post_mentioned.id if notification.post_mentioned else None,
                'read': notification.read
            }
            serialized_notifications.append(notification_details)

        return Response(serialized_notifications, status=status.HTTP_200_OK)
    
    return Response('Invalid Method Request', status=status.HTTP_403_FORBIDDEN)

    

@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def notification_count(request):
    if request.method == 'GET':
        # Only count unread notifications for the current user
        notification_count = Notification.objects.filter(
            recipient_id=request.user.id,
            read=False
        ).count()
        return Response({'count': notification_count}, status=status.HTTP_200_OK)
    return Response('Invalid Method Request', status=status.HTTP_403_FORBIDDEN)

@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.mark_as_read()
        return Response(status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response(
            {"error": "Notification not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    try:
        Notification.objects.filter(
            recipient=request.user,
            read=False
        ).update(read=True)
        return Response({"message": "All notifications marked as read"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def connections(request):
    if request.method == 'GET':
        user = request.user

        # Get all accepted connection objects (from either side)
        accepted_connections = Connection.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            status='ACCEPTED'
        )

        # Gather the "other" user for each accepted connection
        connected_users = []
        for connection in accepted_connections:
            if connection.from_user == user:
                connected_users.append(connection.to_user)
            else:
                connected_users.append(connection.from_user)

        # Remove potential duplicates (if any)
        connected_users = list(set(connected_users))

        serializer = UserProfileSerializer(connected_users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid Method Request'}, status=status.HTTP_403_FORBIDDEN)

@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def send_connection_request(request):
    data = request.data
    to_user_id = data.get('userId')  # The user ID to whom the connection request is sent

    if not to_user_id:
        return Response({"error": "userId is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        to_user = UserProfile.objects.get(id=to_user_id)
    except UserProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if a connection already exists
    existing_connection = Connection.objects.filter(from_user=request.user, to_user=to_user).first()
    if existing_connection:
        if existing_connection.status == 'PENDING':
            return Response({"message": "Connection request already sent."}, status=status.HTTP_400_BAD_REQUEST)
        elif existing_connection.status == 'ACCEPTED':
            return Response({"message": "You are already connected."}, status=status.HTTP_400_BAD_REQUEST)

    # Create a new connection request
    connection = Connection.objects.create(from_user=request.user, to_user=to_user, status='PENDING')
    Notification.objects.create_notif(
        notification_type='CONNECTION_REQUEST',
        sender=request.user,
        recipient=to_user,
        connection=connection,
        )
    return Response({"message": "Connection request sent."}, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def respond_to_connection_request(request):
    data = request.data
    connection_id = data.get('connectionId')  # The ID of the connection to respond to
    action = data.get('action')  # Either 'accept' or 'decline'
    notification_id = data.get('notificationId')  # Optional: the ID of the original connection request notification

    if not connection_id or not action:
        return Response({"error": "connectionId and action are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        connection = Connection.objects.get(id=connection_id)
    except Connection.DoesNotExist:
        return Response({"error": "Connection not found"}, status=status.HTTP_404_NOT_FOUND)

    # Ensure that the current user is the intended recipient for the connection request.
    if connection.to_user != request.user:
        return Response({"error": "You are not authorized to respond to this connection request."}, 
                        status=status.HTTP_403_FORBIDDEN)

    if action == 'accept':
        connection.accept()  # Accepts the connection request

        # Remove the original connection request notification if its ID was provided
        if notification_id:
            try:
                original_notification = Notification.objects.get(id=notification_id, recipient=request.user)
                original_notification.delete()
            except Notification.DoesNotExist:
                pass  # If not found, just continue

        # Create notifications for both users about the accepted connection
        Notification.objects.create_connection_accepted_notification(
            sender=connection.from_user,
            recipient=connection.to_user
        )
        Notification.objects.create_connection_accepted_notification(
            sender=connection.to_user,
            recipient=connection.from_user
        )

        return Response({"message": "Connection request accepted and notifications sent."}, status=status.HTTP_200_OK)
    elif action == 'decline':
        connection.decline()  # Decline the connection request
        return Response({"message": "Connection request declined."}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid action. Use 'accept' or 'decline'."}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def cancel_connection_request(request):
    data = request.data
    to_user_id = data.get('userId')  # The user ID to whom the connection request was sent

    if not to_user_id:
        return Response({"error": "userId is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        to_user = UserProfile.objects.get(id=to_user_id)
    except UserProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if a pending connection request exists
    existing_connection = Connection.objects.filter(from_user=request.user, to_user=to_user, status='PENDING').first()
    if not existing_connection:
        return Response({"error": "No pending connection request found."}, status=status.HTTP_404_NOT_FOUND)

    # Cancel the connection request
    existing_connection.delete()  # Or you can set the status to 'CANCELLED' if you want to keep a record

    # Delete the associated notification using the connection ID
    Notification.objects.filter(
        sender=request.user,
        recipient=to_user,
        notification_type='CONNECTION_REQUEST',
        connection_id=existing_connection.id  # Use the ID instead of the instance
    ).delete()

    return Response({"message": "Connection request canceled and notification deleted."}, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def comments(request):
    if request.method == 'GET':
        post_id = request.GET.get('postId')
        if not post_id:
            return Response("Post ID is required", status=400)
        
        try:
            post = Post.objects.get(id=post_id)
            # Only get top-level comments (those without parents)
            comments = post.comments.filter(parent=None)
            serialized_comments = []
            
            for comment in comments:
                comment_serialized = CommentSerializer(comment)
                comment_data = comment_serialized.data
                serialized_comments.append(comment_data)
            
            return Response(serialized_comments, status=200)
        except Post.DoesNotExist:
            return Response("Post not found", status=404)

    if request.method == 'POST':
        try:
            data = request.data
            post_id = data.get('postId')
            message = data.get('message')
            parent_id = data.get('parentId')  # Get parent comment ID if it exists
            
            if not post_id or not message:
                return Response("Post ID and message are required", status=400)
            
            post = Post.objects.get(id=post_id)
            parent_comment = None
            if parent_id:
                try:
                    parent_comment = Comment.objects.get(id=parent_id)
                except Comment.DoesNotExist:
                    return Response("Parent comment not found", status=404)
            
            converted_tz = pytz.timezone('US/Eastern')
            date_posted = datetime.now(converted_tz)
            
            comment = Comment.objects.create_comment(
                message=message,
                user=request.user,
                post=post,
                date_posted=date_posted,
                parent=parent_comment
            )
            
            # Add a notification for the original poster (if the commenter is not the post owner)
            # Also notify the parent comment owner if this is a reply
            if parent_comment and parent_comment.user != request.user:
                Notification.objects.create(
                    recipient=parent_comment.user,
                    sender=request.user,
                    notification_type="COMMENT",
                    post_mentioned=post,
                    comment=comment
                )
            elif post.user != request.user:
                Notification.objects.create(
                    recipient=post.user,
                    sender=request.user,
                    notification_type="COMMENT",
                    post_mentioned=post,
                    comment=comment
                )
            
            serializer = CommentSerializer(comment)
            return Response(serializer.data, status=201)
            
        except Post.DoesNotExist:
            return Response("Post not found", status=404)
        except Exception as e:
            return Response(str(e), status=400)
    
    return Response('Invalid Method Request', status=403)

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def remove_connection(request):
    data = request.data
    user_id = data.get('userId')  # The user ID of the connection to remove

    if not user_id:
        return Response({"error": "userId is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        other_user = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Find and delete the connection from either direction
    connection = Connection.objects.filter(
        (Q(from_user=request.user) & Q(to_user=other_user)) |
        (Q(from_user=other_user) & Q(to_user=request.user)),
        status='ACCEPTED'
    ).first()

    if not connection:
        return Response({"error": "No active connection found."}, status=status.HTTP_404_NOT_FOUND)

    # Delete any connection-related notifications between these users
    Notification.objects.filter(
        (Q(sender=request.user) & Q(recipient=other_user)) |
        (Q(sender=other_user) & Q(recipient=request.user)),
        notification_type__in=['CONNECTION_REQUEST', 'CONNECTION_ACCEPTED']
    ).delete()

    # Delete the connection
    connection.delete()

    return Response({"message": "Connection removed successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def categories(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        return Response([{'id': cat.id, 'name': cat.name, 'description': cat.description} for cat in categories], status=200)

@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def create_category(request):
    if request.method == 'POST':
        name = request.data.get('name')
        description = request.data.get('description', '')
        
        if not name:
            return Response({'error': 'Category name is required'}, status=400)
            
        if Category.objects.filter(name=name).exists():
            return Response({'error': 'Category already exists'}, status=400)
            
        category = Category.objects.create(name=name, description=description)
        return Response({'id': category.id, 'name': category.name, 'description': category.description}, status=201)