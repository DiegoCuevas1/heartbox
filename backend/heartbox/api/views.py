import json
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http.response import JsonResponse
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view,authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import Family, Notification, UserProfile, Post
from .serializers import FamilySerializer, UserProfileSerializer, PostSerializer
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
            return Response("Failed LOGIN! Check email or password for error.", status=status.HTTP_401_UNAUTHORIZED)
        

        
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

        user = db.objects.create_user(email=email, password=password, first_name=first_name, last_name=last_name, birthdate=birthdate)
        user.pin = pin
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
                "l_name": logged_in_user.last_name
            }
            return JsonResponse({"data": json.dumps(ret_user), "message": "Logged In"}, status=202)
        except:
            return JsonResponse({"message": "Error loading logged in user data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST', 'GET', 'PATCH'])
def post(request):
    if request.method == 'POST':
        email = request.session.get('email',None)
        if email is None or email == '':
            return Response('Access Denied Have Not Logged in', status=403)
        data = request.data
        db = get_user_model()
        if not db.objects.filter(email=email).exists():
            return Response('User with email {0} does not exist')
        
@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def family_posts(request):
    if request.method == 'GET':
        # Ensure the user is authenticated
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Get the user profile using the authenticated user
        user_families = request.user.families.all()
        print(user_families)

        # # Get the families that the user is in
        # user_families = user_profile.families.all()

        # Get the posts in the user's families
        family_posts = Post.objects.filter(family__in=user_families)

        # Serialize the posts or process them as needed
        serializer = PostSerializer(family_posts, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
        
@api_view(['GET','POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def family(request):
    if not request.user.is_authenticated:
        # User is not authenticated, create a custom response indicating the need to log in
        response_data = {'message': 'You need to log in to access this endpoint.'}
        return Response(response_data, status=401)
    
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
            # If familyId is not provided, get all families for the user
            user_families = request.user.families.all()

        serializer = FamilySerializer(user_families, many=True, context={'request': request})
        return Response(serializer.data, status=200)
    
    if request.method == 'POST':
        serializer = FamilySerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Use the custom manager to create the family
            family = Family.objects.create_family(
                family_name=serializer.validated_data['family_name'],
                family_description=serializer.validated_data.get('family_description',None),
                creator=request.user
            )

            # Add the current user to the family members
            request.user.add_to_family(family)
            family.members.add(request.user)
            return Response(FamilySerializer(family, context={'request': request}).data, status=201)

        return Response(serializer.errors, status=400)


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

            other_members = family.members.exclude(pk=user.pk)
            message = f"{user.first_name} {user.last_name} joined the {family.family_name} family."
            timestamp = timezone.now()
            notification = Notification.objects.create_notif(
                    message=message,
                    notification_type='join_family',
                    timestamp=timestamp
                )
            for member in other_members:
                member.notifications.add(notification)


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
        # # Handle GET request
        # post_id = request.GET.get('postId')
        # if post_id:
        #     # If postId is provided, filter the posts based on the ID
        #     try:
        #         user_post = Post.objects.filter(id=post_id, members=request.user)
        #         serializer = PostSerializer(user_post, many=True, context={'request': request})
        #         if serializer.data == []:
        #             return Response('Post Does Not Exist', status=400)
        #         return Response(serializer.data, status=200)

        #     except ValueError:
        #         return Response("Invalid postId format", status=400)
        # else:
        #     # If postId is not provided, get all posts for the user
        #     user_posts= request.user.posts.all()
        #     print(user_posts)

        # family_id = request.GET.get('familyId')
        # if family_id:
        #     try:
        #         user_posts = Post.objects.get_posts_in_family(family_id)
        #         serializer = PostSerializer(user_posts,many=True)
        #         return Response(serializer.data,status=200)
        #     except ValueError:
        #         return Response("Invalid familyId format", status=400)
        # serializer = PostSerializer(user_posts, many=True, context={'request': request})
        # return Response(serializer.data, status=200)
        post_id = request.GET.get('postId')
        if not post_id:
            user = UserProfile.objects.get(email=request.user)
            print(user.posts)
            
            return Response('testing', status=200)

    if request.method == 'POST':
        data = request.data
        data['user']=UserProfile.objects.get(email=request.user).pk
        serializer = PostSerializer(data=request.data,context={'request':request})
        
        if serializer.is_valid():
            family_id = data['familyId']
            try:
                family = get_object_or_404(Family, pk=family_id)
                print(family)
            except Family.DoesNotExist:
                return Response({'error': 'Family does not exist'}, status=status.HTTP_404_NOT_FOUND)
            
            post = Post.objects.create_post(
                title=serializer.validated_data['title'],
                message=data['description'],
                user=request.user,
                family = family,
                date_posted = serializer.validated_data['datePosted']
            ) 
            
            return Response('Your post was successfully created', status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response('Invalid Method Request', status=status.HTTP_403_FORBIDDEN)