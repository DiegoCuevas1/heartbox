import json
from django.shortcuts import render
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http.response import JsonResponse
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile, Relic
from .serializers import UserProfileSerializer, RelicSerializer
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
            return Response("Failed LOGIN!", status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['POST'])
def user_signup(request):
    if request.method == 'POST':
        
        data = request.data
    
        first_name = data.get('f_name')
        last_name = data.get('l_name')
        email = data.get('email')
        password = data.get('password')
        birthdate = data.get('birthdate')

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

        db.objects.create_user(email=email, password=password, first_name=first_name, last_name=last_name, birthdate=birthdate)

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
def relic(request):
    if request.method == 'POST':
        email = request.session.get('email',None)
        if email is None or email == '':
            return Response('Access Denied Have Not Logged in', status=403)
        data = request.data
        db = get_user_model()
        if not db.objects.filter(email=email).exists():
            return Response('User with email {0} does not exist')