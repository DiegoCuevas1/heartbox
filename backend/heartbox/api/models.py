import string
import random
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

class UserProfileManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, birthdate, password=None):
        if not email:
            raise ValueError(_('You must provide an email address'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, last_name=last_name, first_name=first_name, birthdate=birthdate)
        user.set_password(password)
        user.save(using=self._db)
        return user 

    def create_superuser(self, email, first_name, last_name, password):
        user = self.create_user(email, first_name, last_name, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user

class UserProfile(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email'), unique=True)
    last_name = models.CharField(_('lastName'), max_length=100)
    first_name = models.CharField(_('firstName'), max_length=100)
    birthdate = models.DateField(_('birthdate'), blank=True, null=True)
    posts = models.ManyToManyField('Post', related_name='user_posts', related_query_name='user_post')
    pin = models.CharField(_('PIN'), max_length=6)
    objects = UserProfileManager()
    families = models.ManyToManyField('Family', related_name='family_members',related_query_name="family_member")
    notifications = models.ManyToManyField('Notification',related_name="notifications",related_query_name="notification")
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['last_name', 'first_name']


    def __str__(self):
        return self.email
    def add_to_family(self, family):
        self.families.add(family)
        
    def remove_from_family(self,family):
        self.families.remove(family)
      

    def add_to_posts(self,post):
        self.posts.add(post)
  

    def remove_from_posts(self,post):
        self.posts.remove(post)
   


class FamilyManager(models.Manager):
    def create_family(self, family_name, family_description, creator):
        inviteCode = self.generate_invite_code()
        family = self.create(family_name=family_name, family_description=family_description, invite_code=inviteCode)
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
    posts = models.ManyToManyField('Post', related_name='family_posts', related_query_name='family_post')
    objects = FamilyManager()

class PostManager(models.Manager):
    def create_post(self, title, message, user, family=None, date_posted=None):
        post = self.create(
            title=title,
            message=message,
            user=user,
            family=family,
            datePosted=date_posted
        )
        
        return post
    
    def get_posts_in_family(self, family):
        return self.filter(family=family)

class Post(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    family = models.ForeignKey(Family,on_delete=models.CASCADE,null=True)
    message = models.TextField(default="default")
    title = models.CharField(max_length=200)
    datePosted = models.DateField()

    objects = PostManager()
    # For video hosting implementation:
    # video = models.CharField(max_length=500)

class NotificationManager(models.Manager):
    def create_notif(self, message, notification_type, timestamp=None):
        notif = self.create(
            message=message,
            notification_type=notification_type,
            timestamp=timestamp or timezone.now()
        )
        notif.save()
        return notif

class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    message = models.CharField(max_length=300)
    notification_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(default=timezone.now)

    objects=NotificationManager()