import json
from django.test import TestCase, Client
from django.urls import reverse


class UserAuthenticationTests(TestCase):
#################### Signup Tests ####################
    def test_valid_signup(self):
    # Use the client to perform signup with valid field values
        response = self.client.post(reverse('user_signup'), json.dumps({
        'f_name': 'Jerry',
        'l_name': 'Jones',
        'email': 'test19412@example.com',
        'password': 'signuptestpassword1',
        }), content_type='application/json')

        # Check that the response indicates a successful signup
        self.assertEqual(response.status_code, 200)

    def test_valid_signup_name_upper_boundary(self):
        # Use the client to perform signup with valid field values
        response = self.client.post(reverse('user_signup'), json.dumps({
            'f_name': 'JerryJerryJerryJerry',
            'l_name': 'Jones',
            'email': 'test19452@example.com',
            'password': 'signuptestpassword2',
        }), content_type='application/json')

        # Check that the response indicates a successful signup
        self.assertEqual(response.status_code, 200,msg=response.content.decode())
        # self.assertEqual('User signup was successful', response.content.decode())

    def test_invalid_name_signup(self):
        # Use the client to perform signup with invalid (empty) first name
        response = self.client.post(reverse('user_signup'), json.dumps({
            'f_name': '',
            'l_name': 'Jones',
            'email': 'test20432@example.com',
            'password': 'signuptestpassword3',
        }), content_type='application/json')

        # Check that the response indicates an unsuccessful signup due to an invalid first name
        self.assertEqual(response.status_code, 400,msg=response.content.decode())
        # self.assertEqual('First name was invalid', response.content.decode())

    def test_invalid_name_signup2(self):
        
        # Use the client to perform signup with invalid (more than 20 characters) last name
        response = self.client.post(reverse('user_signup'), json.dumps({
            'f_name': 'Gerald',
            'l_name': 'JonesJonesJonesJonesM',
            'email': 'test21432@example.com',
            'password': 'signuptestpassword4',
        }), content_type='application/json')

        # Check that the response indicates an unsuccessful signup due to an invalid last name
        self.assertEqual(response.status_code, 400,msg=response.content.decode())
        # self.assertEqual('Last name was invalid', response.content.decode())

    def test_existing_email_signup(self):
        response1 = self.client.post(reverse('user_signup'), json.dumps({
            'f_name': 'Bo',
            'l_name': 'Evan',
            'email': 'testemail@gmail.com',
            'password': 'signuptestpass',
        }), content_type='application/json')
        # Use the client to perform signup with an existing email 
        response = self.client.post(reverse('user_signup'), json.dumps({
            'f_name': 'Bob',
            'l_name': 'Evanshire',
            'email': 'testemail@gmail.com',
            'password': 'signuptestpassword5',
        }), content_type='application/json')

        # Check that the response indicates an unsuccessful signup due to an existing email 
        # being sent in the request
        self.assertEqual(response.status_code, 409, msg=response.content.decode())

    #################### Login Tests ####################
    def test_valid_login(self):
        # Use the client to perform login with valid credentials
        sent = self.client.post(reverse('user_signup'), json.dumps({
            'f_name': 'Bob',
            'l_name': 'Evanshire',
            'email': 'test@example.com',
            'password': 'testpassword'
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