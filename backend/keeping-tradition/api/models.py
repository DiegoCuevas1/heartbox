from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

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
    email = models.EmailField(_('email address'), unique=True)
    last_name = models.CharField(_('last name'), max_length=100)
    first_name = models.CharField(_('first name'), max_length=100)
    birthdate = models.DateField(_('birthdate'), blank=True, null=True)
    
    objects = UserProfileManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['last_name', 'first_name']

    def __str__(self):
        return self.email

class RelicManager(models.Manager):
    def create_relic(self,title,description, **other_fields):
        if not title:
            raise ValueError(_('You must provide a title for the relic.'))
        relic = self.model(title=title,description=description,**other_fields)
        relic.save()
        return relic

class Relic(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    title = models.CharField(max_length=250)
    description = models.CharField(max_length=500)
    datePosted = models.DateField()
    image = models.CharField(max_length=500)