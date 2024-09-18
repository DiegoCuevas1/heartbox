from datetime import datetime
import json
import os
import uuid
import boto3
from botocore.exceptions import ClientError
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

from website import settings

from .models import Family, Notification, UserProfile, Post
from .serializers import FamilySerializer, NotificationSerializer, UserProfileSerializer, PostSerializer
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


        
        if profile_pic:
            file_extension = os.path.splitext(profile_pic.name)[1]  # Get file extension
            unique_filename = str(uuid.uuid4()) + file_extension  # Generate unique filename

            try:
                s3_client = boto3.client('s3',
                                         aws_access_key_id=settings.AWS_S3_ACCESS_KEY_ID,
                                         aws_secret_access_key=settings.AWS_S3_SECRET_ACCESS_KEY,
                                         region_name=settings.AWS_S3_REGION_NAME
                                         )
                bucket_name = settings.AWS_STORAGE_BUCKET_NAME
                folder_name = 'profile_pics'  # Specify the folder name here
                key = f'{folder_name}/{unique_filename}'  # Concatenate folder name with unique filename
                s3_client.upload_fileobj(profile_pic, bucket_name, key)
            except ClientError as e:
                return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user = db.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            birthdate=birthdate,
            pin=pin,
            password=password,
            profile_picture=unique_filename if profile_pic else None  # Assign unique filename if profile pic exists
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
                "id": logged_in_user.id,
                "f_name": logged_in_user.first_name,
                "l_name": logged_in_user.last_name,
                "profilePic": logged_in_user.profile_picture
            }
            return JsonResponse({"data": json.dumps(ret_user), "message": "Logged In"}, status=202)
        except:
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
        
        if family_pic:
            file_extension = os.path.splitext(family_pic.name)[1] 
            unique_filename = str(uuid.uuid4()) + file_extension  
           
            try:
                s3_client = boto3.client('s3',
                                         aws_access_key_id=settings.AWS_S3_ACCESS_KEY_ID,
                                         aws_secret_access_key=settings.AWS_S3_SECRET_ACCESS_KEY,
                                         region_name=settings.AWS_S3_REGION_NAME
                                         )
                bucket_name = settings.AWS_STORAGE_BUCKET_NAME
                folder_name = 'family_pics'  # Specify the folder name here
                key = f'{folder_name}/{unique_filename}'  # Concatenate folder name with unique filename
                s3_client.upload_fileobj(family_pic, bucket_name, key)
            except ClientError as e:
                return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        family = Family.objects.create_family(
            family_name=request.data['family_name'],
            family_description=request.data['family_description'],
            creator = request.user,
            family_picture= unique_filename if family_pic else None
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
                user_families = Family.objects.filter(id=family_id, members=request.user)
                serializer = FamilySerializer(user_families, many=True, context={'request': request})
                if serializer.data == []:
                    return Response('Family Does Not Exist', status=400)
                return Response(serializer.data['members'], status=200)

            except ValueError:
                return Response("Invalid familyId format", status=400)
        
        return Response('it works',status=200)


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
def post(request):
    if request.method == 'GET':
        post_id = request.GET.get('postId')
        family_id = request.GET.get('familyId')
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
                            'user_details': user_details
                        }
                        serialized_posts.append(post_data)

                    return Response(serialized_posts, status=200)
                else:
                    return Response("User is not a member of this family", status=status.HTTP_403_FORBIDDEN)
            except Family.DoesNotExist:
                return Response("Family not found", status=404)
        
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
                'user_details': user_details
            }
            serialized_posts.append(post_data)

        return Response(serialized_posts,200)


    if request.method == 'POST':
       
        # data = request.data
        try:
            # Assuming email is passed in the request data
            user_profile = UserProfile.objects.get(id=request.user.id)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        data= request.data
        data['user'] = request.user.id
        
        converted_tz = pytz.timezone('US/Eastern')
        # Convert the current time to EST
       
        data['datePosted'] = datetime.now(converted_tz)
        serializer = PostSerializer(data=data,context={'request':request})      
        
        # serializer = PostSerializer(data=request.data,context={'request':request})
        
        if serializer.is_valid():
            family_id=data['familyId']
            try:
                family = get_object_or_404(Family, id=family_id)
            except Family.DoesNotExist:
                return Response({'error': 'Family does not exist'}, status=status.HTTP_404_NOT_FOUND)
            post = Post.objects.create_post(
                title=request.data['title'],
                message=request.data['description'],
                user=UserProfile.objects.get(id=request.user.id),
                family = Family.objects.get(id=request.data['familyId']),
                date_posted = data['datePosted']
            ) 
            return Response('Your post was successfully created', status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    return Response('Invalid Method Request', status=status.HTTP_403_FORBIDDEN)



@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def notification(request):  # Accept the notificationId as a parameter
    if request.method == 'GET':
        notificationId = request.GET.get('notificationId')
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
                    'family_details':family_details
                }
                return Response(notification_details, status=status.HTTP_200_OK)
            except Notification.DoesNotExist:
                return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

        # If notificationId is not provided, retrieve all notifications for the user
        notifications = Notification.objects.filter(recipient_id=request.user.id)
        serialized_notifications = []
        for notification in notifications:
            serializer = NotificationSerializer(notification)
            family_details=None
            if serializer.data['family_joined']:
                family = Family.objects.get(id=serializer.data['family_joined'])
                family_details={
                    'id':family.id,
                    'family_name':family.family_name,
                    'family_picture':family.family_picture
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
                'family_details':family_details
            }
            serialized_notifications.append(notification_details)

        return Response(serialized_notifications, status=status.HTTP_200_OK)
    
    return Response('Invalid Method Request', status=status.HTTP_403_FORBIDDEN)

    

@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def notification_count(request):
    if request.method == 'GET':
        # Retrieve the count of notifications for the current user
        notification_count = Notification.objects.filter(recipient_id=request.user.id).count()
        return Response({'count': notification_count}, status=status.HTTP_200_OK)
    return Response('Invalid Method Request', status=status.HTTP_403_FORBIDDEN)