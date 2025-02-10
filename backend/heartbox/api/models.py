import string
import random
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Group, Permission
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from cloudinary.models import CloudinaryField

class UserProfileManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, birthdate, pin, password=None,profile_picture=None,):
        if not email:
            raise ValueError(_('You must provide an email address'))
        if profile_picture is None:
            profile_picture = 'default_profpic.png'
        email = self.normalize_email(email)
        user = self.model(email=email, last_name=last_name, first_name=first_name, birthdate=birthdate,pin=pin,profile_picture=profile_picture)
        user.set_password(password)
        user.save(using=self._db)
        return user 

    def create_superuser(self, email, first_name, last_name, birthdate, password, pin):
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
    pin = models.CharField(_('PIN'), max_length=100)
    profile_picture = models.CharField('profile picture', max_length=255, default='profile_pictures/default_prof')
    posts = models.ManyToManyField('Post', related_name='user_posts', related_query_name='user_post')
    liked = models.ManyToManyField('Post', related_name='liked_by', blank=True)
    is_staff = models.BooleanField(_('staff status'), default=False)
    objects = UserProfileManager()
    families = models.ManyToManyField('Family', related_name='family_members',related_query_name="family_member")
    connections = models.ManyToManyField(
        'self',
        through='Connection',
        through_fields=('from_user', 'to_user'),
        symmetrical=False,
        related_name='connected_to'
    )

    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['last_name', 'first_name','birthdate','pin']


    def __str__(self):
        return self.first_name + ' ' + self.last_name
    def add_to_family(self, family):
        self.families.add(family)
        
    def remove_from_family(self,family):
        self.families.remove(family)
      

    def add_to_posts(self,post):
        self.posts.add(post)
  

    def remove_from_posts(self,post):
        self.posts.remove(post)
    
    def get_connection_status(self, other_user):
        connection = self.connections_from.filter(to_user=other_user).first()
        if connection:
            return connection.status  # This will return 'PENDING', 'ACCEPTED', or 'DECLINED'
        return 'none'


class Connection(models.Model):
    RELATIONSHIP_CHOICES = [
        ('FRIEND', 'Friend'),
        ('FAMILY', 'Family'),
        ('COLLEAGUE', 'Colleague'),
        ('OTHER', 'Other'),
    ]

    from_user = models.ForeignKey(
        'UserProfile',
        on_delete=models.CASCADE,
        related_name='connections_from'
    )
    to_user = models.ForeignKey(
        'UserProfile', 
        on_delete=models.CASCADE,
        related_name='connections_to'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('ACCEPTED', 'Accepted'),
            ('DECLINED', 'Declined')
        ],
        default='PENDING'
    )
    relationship_type = models.CharField(
        max_length=20,
        choices=RELATIONSHIP_CHOICES,
        default='FRIEND'
    )

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

class FamilyManager(models.Manager):
    def create_family(self, family_name, family_description, creator, family_picture=None):
        invite_code = self.generate_invite_code()
        if family_picture is None:
            family_picture = 'families.png'
        family = self.create(
            family_name=family_name,
            family_description=family_description,
            invite_code=invite_code,
            family_picture=family_picture
        )
        family.members.add(creator)
        family.creator = creator
        family.save()
        return family

    def generate_invite_code(self, length=6):
        # Generate a random alphanumeric invite code
        characters = string.ascii_letters + string.digits
        invite_code = ''.join(random.choice(characters) for _ in range(length))

        while self.filter(invite_code=invite_code).exists():
            # Regenerate if the invite code already exists
            invite_code = ''.join(random.choice(characters) for _ in range(length))

        return invite_code
    


class Family(models.Model):
    id = models.AutoField(primary_key=True)
    family_name = models.CharField(max_length=250)
    family_description = models.CharField(max_length=500,blank=True)
    invite_code = models.CharField(max_length=50, unique=True)
    members = models.ManyToManyField(get_user_model(), related_name='user_families')
    posts = models.ManyToManyField('Post', related_name='family_posts', related_query_name='family_post',blank=True, null=True)
    family_picture = models.CharField('family_picture',blank=True,null=True,)
    objects = FamilyManager()

    class Meta:
        verbose_name_plural = "families"


class PostManager(models.Manager):
    def create_post(self, title, message, user, family=None, date_posted=None):
        post = self.create(
            title=title,
            message=message,
            user=user,
            family=family,
            datePosted=date_posted
        )
        post.save()
        return post
    def like_post(self, post, user):
        post.likes.add(user)

    def unlike_post(self, post, user):
        post.likes.remove(user)

    def get_posts_in_family(self, family):
        return self.filter(family=family)

class Post(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    family = models.ForeignKey(Family,on_delete=models.CASCADE,null=True)
    message = models.TextField(default="default")
    title = models.CharField(max_length=200)
    datePosted = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(get_user_model(), related_name='liked_posts', blank=True)
 
    objects = PostManager()
    # For video hosting implementation:
    # video = models.CharField(max_length=500)

class NotificationManager(models.Manager):
    def create_notif(self, notification_type, sender, recipient, connection=None, post_mentioned=None, family_joined=None, timestamp=None):
        if timestamp is None:
            timestamp = timezone.now()
        return self.create(
            notification_type=notification_type,
            sender=sender,
            recipient=recipient,
            connection=connection,
            post_mentioned=post_mentioned,
            family_joined=family_joined,
            timestamp=timestamp
        )
    def create_group_join_notification(self, sender, recipient, family_joined):
        notification_type = 'GROUP_JOIN'
        timestamp = timezone.now()  # Current timestamp

        # Call create_notif method to create the notification
        return Notification.objects.create_notif(
            notification_type=notification_type,
            sender=sender,
            recipient=recipient,
            family_joined=family_joined,
            timestamp=timestamp
        )

    # Example usage to create a post mention notification
    def create_post_mention_notification(self, sender, recipient, post_mentioned):
        notification_type = 'POST_MENTION'
        timestamp = timezone.now()  # Current timestamp

        # Call create_notif method to create the notification
        Notification.objects.create_notif(
            notification_type=notification_type,
            sender=sender,
            recipient=recipient,
            post_mentioned=post_mentioned,
            timestamp=timestamp
        )

# Example usage to create a group invitation notification
    def create_group_invitation_notification(self, sender, recipient):
        notification_type = 'GROUP_INVITATION'
        timestamp = timezone.now()  # Current timestamp

        # Call create_notif method to create the notification
        Notification.objects.create_notif(
            notification_type=notification_type,
            sender=sender,
            recipient=recipient,
            timestamp=timestamp
        )

class Notification(models.Model):
    NOTIFICATION_TYPES = (
            ('GROUP_JOIN', 'Group Join'),
            ('POST_MENTION', 'Post Mention'),
            ('GROUP_INVITATION', 'Group Invitation'),
            ('CONNECTION_REQUEST','Connection Request'),
            # Add more notification types as needed
        )
    id = models.AutoField(primary_key=True)
    notification_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(default=timezone.now)
    sender = models.ForeignKey(get_user_model(),related_name='sent_notifications', on_delete=models.CASCADE)
    recipient = models.ForeignKey(get_user_model(),related_name='received_notifications',on_delete=models.CASCADE)
    family_joined = models.ForeignKey('Family', related_name='family_notifications', on_delete=models.CASCADE, null=True, blank=True)
    post_mentioned = models.ForeignKey('Post', related_name='post_notifications',on_delete=models.CASCADE,null=True,blank=True)
    connection = models.ForeignKey('Connection', on_delete=models.CASCADE, null=True, blank=True)
    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.notification_type} Notification'
    
    objects=NotificationManager()