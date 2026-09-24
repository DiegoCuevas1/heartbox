import secrets
import uuid

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.db.models import Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

DEFAULT_PROFILE_PICTURE = 'profile_pictures/default_prof'
DEFAULT_FAMILY_PICTURE = 'family_pictures/families'

# Relic categories offered in the UI. Posts may only be filed under one of these.
RELIC_CATEGORIES = [
    'Wedding',
    'Christmas',
    'Birthday',
    'Anniversary',
    'Graduation',
    'New Year',
    'Halloween',
    "Valentine's",
    'Other',
]


class UserProfileManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, birthdate=None, pin=None, password=None, profile_picture=None):
        if not email:
            raise ValueError(_('You must provide an email address'))
        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            birthdate=birthdate or None,
            profile_picture=profile_picture or DEFAULT_PROFILE_PICTURE,
        )
        user.set_pin(pin)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, birthdate=None, password=None, pin=None):
        user = self.create_user(email, first_name, last_name, birthdate, pin, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class UserProfile(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email'), unique=True)
    last_name = models.CharField(_('lastName'), max_length=100)
    first_name = models.CharField(_('firstName'), max_length=100)
    birthdate = models.DateField(_('birthdate'), blank=True, null=True)
    # Stored hashed, like a password.
    pin = models.CharField(_('PIN'), max_length=128, blank=True)
    profile_picture = models.CharField('profile picture', max_length=255, default=DEFAULT_PROFILE_PICTURE)
    is_staff = models.BooleanField(_('staff status'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    connections = models.ManyToManyField(
        'self',
        through='Connection',
        through_fields=('from_user', 'to_user'),
        symmetrical=False,
        related_name='connected_to'
    )

    objects = UserProfileManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    def set_pin(self, raw_pin):
        self.pin = make_password(raw_pin) if raw_pin else ''

    def check_pin(self, raw_pin):
        return bool(self.pin) and check_password(raw_pin, self.pin)

    def get_connection_status(self, other_user):
        connection = Connection.objects.filter(
            Q(from_user=self, to_user=other_user) | Q(from_user=other_user, to_user=self)
        ).first()
        if connection:
            return connection.status  # 'PENDING', 'ACCEPTED' or 'DECLINED'
        return 'none'


class Connection(models.Model):
    RELATIONSHIP_CHOICES = [
        ('FRIEND', 'Friend'),
        ('FAMILY', 'Family'),
        ('COLLEAGUE', 'Colleague'),
        ('OTHER', 'Other'),
    ]

    from_user = models.ForeignKey('UserProfile', on_delete=models.CASCADE, related_name='connections_from')
    to_user = models.ForeignKey('UserProfile', on_delete=models.CASCADE, related_name='connections_to')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('DECLINED', 'Declined')],
        default='PENDING'
    )
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, default='FRIEND')

    class Meta:
        unique_together = ('from_user', 'to_user')
        indexes = [
            models.Index(fields=['from_user', 'status']),
            models.Index(fields=['to_user', 'status'])
        ]

    def accept(self):
        self.status = 'ACCEPTED'
        self.save()

    def decline(self):
        self.status = 'DECLINED'
        self.save()

    def __str__(self):
        return f"{self.from_user} -> {self.to_user} ({self.status}, {self.relationship_type})"


# No 0/O/1/I so codes are easy to read aloud and type.
INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
INVITE_CODE_LENGTH = 8


class FamilyManager(models.Manager):
    def create_family(self, family_name, family_description, creator, family_picture=None):
        family = self.create(
            family_name=family_name,
            family_description=family_description or '',
            invite_code=self.generate_invite_code(),
            family_picture=family_picture or DEFAULT_FAMILY_PICTURE,
            creator=creator,
        )
        family.members.add(creator)
        return family

    def generate_invite_code(self):
        while True:
            code = ''.join(secrets.choice(INVITE_CODE_ALPHABET) for _ in range(INVITE_CODE_LENGTH))
            if not self.filter(invite_code=code).exists():
                return code


class Family(models.Model):
    """A HeartBox: a private group (usually a family) that Relics are shared into."""
    id = models.AutoField(primary_key=True)
    family_name = models.CharField(max_length=250)
    family_description = models.CharField(max_length=500, blank=True)
    invite_code = models.CharField(max_length=50, unique=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='families', blank=True)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_families'
    )
    family_picture = models.CharField('family_picture', max_length=255, blank=True, default=DEFAULT_FAMILY_PICTURE)
    created_at = models.DateTimeField(default=timezone.now)

    objects = FamilyManager()

    class Meta:
        verbose_name_plural = "families"

    def __str__(self):
        return self.family_name

    def is_member(self, user):
        return self.members.filter(pk=user.pk).exists()

    def regenerate_invite_code(self):
        self.invite_code = Family.objects.generate_invite_code()
        self.save(update_fields=['invite_code'])


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class PostQuerySet(models.QuerySet):
    def visible_to(self, user):
        """Relics in HeartBoxes the user belongs to."""
        return self.filter(family__members=user)


class PostManager(models.Manager.from_queryset(PostQuerySet)):
    def create_post(self, title, message, user, family, media_type=None, media_url=None, categories=None, date_posted=None):
        post = self.create(
            title=title,
            message=message,
            user=user,
            family=family,
            media_type=media_type,
            media_url=media_url,
        )
        if categories:
            post.categories.set(categories)
        return post

    def get_posts_in_family(self, family):
        return self.filter(family=family)


class Post(models.Model):
    """A Relic: anything a member places in a HeartBox."""
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='posts')
    message = models.TextField(blank=True, default='')
    title = models.CharField(max_length=200)
    datePosted = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    media_type = models.CharField(max_length=10, choices=[('IMAGE', 'Image'), ('VIDEO', 'Video')], null=True, blank=True)
    media_url = models.CharField(max_length=500, null=True, blank=True)  # Cloudinary public_id
    categories = models.ManyToManyField('Category', related_name='posts', blank=True)

    objects = PostManager()

    class Meta:
        ordering = ['-datePosted', '-id']
        indexes = [models.Index(fields=['family', '-datePosted'])]

    def __str__(self):
        return self.title


class CommentManager(models.Manager):
    def create_comment(self, message, user, post, parent=None, date_posted=None):
        return self.create(message=message, user=user, post=post, parent=parent)


class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    message = models.TextField()
    datePosted = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

    objects = CommentManager()

    class Meta:
        ordering = ['-datePosted']


class NotificationManager(models.Manager):
    def create_notif(self, notification_type, sender, recipient, connection=None, post_mentioned=None,
                     family_joined=None, comment=None, timestamp=None):
        return self.create(
            notification_type=notification_type,
            sender=sender,
            recipient=recipient,
            connection=connection,
            post_mentioned=post_mentioned,
            family_joined=family_joined,
            comment=comment,
            timestamp=timestamp or timezone.now(),
        )

    def create_group_join_notification(self, sender, recipient, family_joined):
        return self.create_notif('GROUP_JOIN', sender, recipient, family_joined=family_joined)

    def create_post_mention_notification(self, sender, recipient, post_mentioned):
        return self.create_notif('POST_MENTION', sender, recipient, post_mentioned=post_mentioned)

    def create_group_invitation_notification(self, sender, recipient):
        return self.create_notif('GROUP_INVITATION', sender, recipient)

    def create_connection_accepted_notification(self, sender, recipient):
        return self.create_notif('CONNECTION_ACCEPTED', sender, recipient)


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('GROUP_JOIN', 'Group Join'),
        ('POST_MENTION', 'Post Mention'),
        ('GROUP_INVITATION', 'Group Invitation'),
        ('CONNECTION_REQUEST', 'Connection Request'),
        ('CONNECTION_ACCEPTED', 'Connection Accepted'),
        ('COMMENT', 'Comment'),
        ('LIKE', 'Like'),
    )
    id = models.AutoField(primary_key=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    timestamp = models.DateTimeField(default=timezone.now)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_notifications', on_delete=models.CASCADE)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_notifications', on_delete=models.CASCADE)
    family_joined = models.ForeignKey('Family', related_name='family_notifications', on_delete=models.CASCADE, null=True, blank=True)
    post_mentioned = models.ForeignKey('Post', related_name='post_notifications', on_delete=models.CASCADE, null=True, blank=True)
    connection = models.ForeignKey('Connection', on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey('Comment', on_delete=models.CASCADE, null=True, blank=True)
    read = models.BooleanField(default=False)

    objects = NotificationManager()

    class Meta:
        ordering = ['-timestamp']
        indexes = [models.Index(fields=['recipient', 'read', '-timestamp'])]

    def __str__(self):
        return f'{self.notification_type} Notification'

    def mark_as_read(self):
        self.read = True
        self.save(update_fields=['read'])
