from django.utils import timezone
import json
from django.test import TestCase, Client
from django.urls import reverse

from .models import Family, Notification, Post
from .models import UserProfile


class UserAuthenticationTests(TestCase):
#################### Signup Tests ####################
    def test_valid_signup(self):
    # Use the client to perform signup with valid field values
        response = self.client.post(reverse('user_signup'), json.dumps({
        'firstName': 'Jerry',
        'lastName': 'Jones',
        'email': 'test19412@example.com',
        'password': 'signuptestpassword1',
        'pin':'0000'
        }), content_type='application/json')

        # Check that the response indicates a successful signup
        self.assertEqual(response.status_code, 200)

    def test_valid_signup_name_upper_boundary(self):
        # Use the client to perform signup with valid field values
        response = self.client.post(reverse('user_signup'), json.dumps({
            'firstName': 'JerryJerryJerryJerry',
            'lastName': 'Jones',
            'email': 'test19452@example.com',
            'password': 'signuptestpassword2',
            'pin':'0000'
        }), content_type='application/json')

        # Check that the response indicates a successful signup
        self.assertEqual(response.status_code, 200,msg=response.content.decode())
        # self.assertEqual('User signup was successful', response.content.decode())

    def test_invalid_name_signup(self):
        # Use the client to perform signup with invalid (empty) first name
        response = self.client.post(reverse('user_signup'), json.dumps({
            'firstName': '',
            'lastName': 'Jones',
            'email': 'test20432@example.com',
            'password': 'signuptestpassword3',
            'pin':'0000'
        }), content_type='application/json')

        # Check that the response indicates an unsuccessful signup due to an invalid first name
        self.assertEqual(response.status_code, 400,msg=response.content.decode())
        # self.assertEqual('First name was invalid', response.content.decode())

    def test_invalid_name_signup2(self):
        
        # Use the client to perform signup with invalid (more than 20 characters) last name
        response = self.client.post(reverse('user_signup'), json.dumps({
            'firstName': 'Gerald',
            'lastName': 'JonesJonesJonesJonesM',
            'email': 'test21432@example.com',
            'password': 'signuptestpassword4',
            'pin':'0000'
        }), content_type='application/json')

        # Check that the response indicates an unsuccessful signup due to an invalid last name
        self.assertEqual(response.status_code, 400,msg=response.content.decode())
        # self.assertEqual('Last name was invalid', response.content.decode())

    def test_existing_email_signup(self):
        response1 = self.client.post(reverse('user_signup'), json.dumps({
            'firstName': 'Bo',
            'lastName': 'Evan',
            'email': 'testemail@gmail.com',
            'password': 'signuptestpass',
            'pin':'0000'
        }), content_type='application/json')
        # Use the client to perform signup with an existing email 
        response = self.client.post(reverse('user_signup'), json.dumps({
            'firstName': 'Bob',
            'lastName': 'Evanshire',
            'email': 'testemail@gmail.com',
            'password': 'signuptestpassword5',
            'pin':'0000'
        }), content_type='application/json')

        # Check that the response indicates an unsuccessful signup due to an existing email 
        # being sent in the request
        self.assertEqual(response.status_code, 409, msg=response.content.decode())

    #################### Login Tests ####################
    def test_valid_login(self):
        # Use the client to perform login with valid credentials
        sent = self.client.post(reverse('user_signup'), json.dumps({
            'firstName': 'Bob',
            'lastName': 'Evanshire',
            'email': 'test@example.com',
            'password': 'testpassword',
            'pin':'0000'
        }), content_type='application/json')
        
        self.assertEqual(sent.status_code, 200,msg=sent.content.decode())
        
        response = self.client.post(reverse('user_login'), json.dumps({
            'email': 'test@example.com',
            'password': 'testpassword'
        }), content_type='application/json')

        # Check that the response indicates a successful login
        self.assertEqual(response.status_code, 202,msg=sent.content.decode())
        # self.assertIn('Login successful!', response.content.decode())


    def test_invalid_login(self):
        # Use the client to perform login with invalid credentials
        response = self.client.post(reverse('user_login'), json.dumps({
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }), content_type='application/json')

        # Check that the response indicates an authentication failure
        self.assertEqual(response.status_code, 401,msg=response.content.decode())
        # self.assertIn('Authentication failed!', response.content.decode())
class NotificationManagerTestCase(TestCase):
    def setUp(self):
        self.sender = UserProfile.objects.create_user(
            email='sender@example.com',
            first_name='Sender',
            last_name='Lastname',
            birthdate='2010-02-05',  # Fill in the birthdate
            pin='1234',  # Fill in the PIN
            password='password'  # Fill in the password
        )
        self.recipient = UserProfile.objects.create_user(
            email='recipient@example.com',
            first_name='Recipient',
            last_name='Lastname',
            birthdate='2000-12-24',  # Fill in the birthdate
            pin='5678',  # Fill in the PIN
            password='password'  # Fill in the password
        ) 
        self.family = Family.objects.create_family(
            family_name='family_name',
            family_description='family_description',
            creator=self.sender,
            family_picture='family_pic.png'
        )
        self.post_mentioned = Post.objects.create_post(
            title='Title',
            message='Message',
            user=self.sender,
            family=self.family,
            date_posted=timezone.now()
        )
    def test_create_post_mention_notification(self):
        # Create sender, recipient, and post_mentioned objects for testing
        sender = self.sender # Create or retrieve sender object
        recipient =self.recipient# Create or retrieve recipient object
        post_mentioned = self.post_mentioned # Create or retrieve post_mentioned object
    
        # Call create_post_mention_notification method
        Notification.objects.create_post_mention_notification(sender, recipient, post_mentioned)
        
        # Verify that the notification was created correctly
        notification = Notification.objects.filter(sender=sender, recipient=recipient).first()
        self.assertIsNotNone(notification)
        self.assertEqual(notification.notification_type, 'POST_MENTION')
        # Add more assertions as needed
        
    def test_create_group_invitation_notification(self):
        # Create sender and recipient objects for testing
        sender = self.sender# Create or retrieve sender object
        recipient = self.recipient# Create or retrieve recipient object
        
        # Call create_group_invitation_notification method
        Notification.objects.create_group_invitation_notification(sender, recipient)
        
        # Verify that the notification was created correctly
        notification = Notification.objects.filter(sender=sender, recipient=recipient).first()
        self.assertIsNotNone(notification)
        self.assertEqual(notification.notification_type, 'GROUP_INVITATION')