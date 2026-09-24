import json
import re
from unittest import mock

from django.core import mail
from django.core.cache import cache
from django.test import Client, TestCase
from django.urls import reverse

from .models import Comment, Connection, Family, Notification, Post, UserProfile
from .views import resolve_category


def make_user(email, first='Test', last='User', password='a-strong-password-123'):
    return UserProfile.objects.create_user(
        email=email, first_name=first, last_name=last, birthdate='1990-01-01', pin='1234', password=password
    )


class ThrottleResetMixin:
    def setUp(self):
        super().setUp()
        cache.clear()


#################### Auth ####################

class UserAuthenticationTests(ThrottleResetMixin, TestCase):
    def signup(self, **overrides):
        payload = {
            'firstName': 'Jerry',
            'lastName': 'Jones',
            'email': 'jerry@example.com',
            'password': 'signuptestpassword1',
            'pin': '0000',
        }
        payload.update(overrides)
        return self.client.post(reverse('user_signup'), json.dumps(payload), content_type='application/json')

    def test_valid_signup(self):
        response = self.signup()
        self.assertEqual(response.status_code, 200, msg=response.content.decode())

    def test_valid_signup_name_upper_boundary(self):
        response = self.signup(firstName='JerryJerryJerryJerry')
        self.assertEqual(response.status_code, 200, msg=response.content.decode())

    def test_invalid_name_signup(self):
        self.assertEqual(self.signup(firstName='').status_code, 400)

    def test_invalid_name_signup_too_long(self):
        self.assertEqual(self.signup(lastName='JonesJonesJonesJonesM').status_code, 400)

    def test_existing_email_signup(self):
        self.signup()
        response = self.signup(firstName='Bob', email='JERRY@example.com')
        self.assertEqual(response.status_code, 409, msg=response.content.decode())

    def test_weak_password_rejected(self):
        self.assertEqual(self.signup(password='123').status_code, 400)

    def test_pin_is_hashed(self):
        self.signup()
        user = UserProfile.objects.get(email='jerry@example.com')
        self.assertNotEqual(user.pin, '0000')
        self.assertTrue(user.check_pin('0000'))

    def test_valid_login_and_check_login(self):
        self.signup()
        response = self.client.post(reverse('user_login'), json.dumps({
            'email': 'jerry@example.com', 'password': 'signuptestpassword1'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 202)

        response = self.client.get(reverse('check_login'))
        self.assertEqual(response.status_code, 202)
        self.assertEqual(json.loads(response.json()['data'])['f_name'], 'Jerry')

    def test_invalid_login(self):
        response = self.client.post(reverse('user_login'), json.dumps({
            'email': 'test@example.com', 'password': 'wrongpassword'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 401)

    def test_check_login_sets_csrf_cookie(self):
        response = self.client.get(reverse('check_login'))
        self.assertIn('csrftoken', response.cookies)

    def test_login_is_throttled(self):
        for _ in range(10):
            self.client.post(reverse('user_login'), json.dumps({'email': 'x@example.com', 'password': 'x'}),
                             content_type='application/json')
        response = self.client.post(reverse('user_login'), json.dumps({'email': 'x@example.com', 'password': 'x'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 429)


class CsrfTests(ThrottleResetMixin, TestCase):
    def test_authenticated_unsafe_request_requires_csrf_token(self):
        user = make_user('csrf@example.com')
        client = Client(enforce_csrf_checks=True)
        client.force_login(user)

        response = client.post(reverse('family'), {'family_name': 'No token'})
        self.assertEqual(response.status_code, 403)

        client.get(reverse('check_login'))
        token = client.cookies['csrftoken'].value
        response = client.post(reverse('family'), {'family_name': 'With token'}, HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 201, msg=response.content.decode())


class PasswordResetTests(ThrottleResetMixin, TestCase):
    def test_reset_flow(self):
        make_user('reset@example.com', password='old-password-123')
        response = self.client.post(reverse('forgot_password'), json.dumps({'email': 'reset@example.com'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

        match = re.search(r'uid=([^&\s]+)&token=([^\s]+)', mail.outbox[0].body)
        uid, token = match.group(1), match.group(2)
        response = self.client.post(reverse('reset_password'), json.dumps({
            'uid': uid, 'token': token, 'password': 'brand-new-password-456'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200, msg=response.content.decode())
        self.assertTrue(self.client.login(email='reset@example.com', password='brand-new-password-456'))

        # Tokens are single use.
        response = self.client.post(reverse('reset_password'), json.dumps({
            'uid': uid, 'token': token, 'password': 'another-password-789'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_unknown_email_gives_same_response(self):
        response = self.client.post(reverse('forgot_password'), json.dumps({'email': 'nobody@example.com'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)


#################### Privacy: HeartBoxes & relics ####################

class HeartBoxPrivacyTests(ThrottleResetMixin, TestCase):
    """Relics must never be visible outside the HeartBoxes they were placed in."""

    def setUp(self):
        super().setUp()
        self.alice = make_user('alice@example.com', 'Alice')
        self.bob = make_user('bob@example.com', 'Bob')
        self.eve = make_user('eve@example.com', 'Eve')

        self.smiths = Family.objects.create_family('Smiths', '', creator=self.alice)
        self.smiths.members.add(self.bob)
        self.joneses = Family.objects.create_family('Joneses', '', creator=self.alice)
        self.eves = Family.objects.create_family('Eve family', '', creator=self.eve)

        self.smith_post = Post.objects.create_post('Smith relic', 'hi', self.alice, self.smiths)
        self.jones_post = Post.objects.create_post('Jones relic', 'hi', self.alice, self.joneses)
        self.eve_post = Post.objects.create_post('Eve relic', 'hi', self.eve, self.eves)

        self.client.force_login(self.alice)

    def ids(self, response):
        return {p['id'] for p in response.json()}

    def test_timeline_includes_every_family_the_user_belongs_to(self):
        response = self.client.get(reverse('posts'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.ids(response), {self.smith_post.id, self.jones_post.id})

    def test_timeline_pagination(self):
        for i in range(5):
            Post.objects.create_post(f'extra {i}', '', self.alice, self.smiths)
        first = self.client.get(reverse('posts'), {'limit': 3}).json()
        self.assertEqual(len(first), 3)
        second = self.client.get(reverse('posts'), {'limit': 3, 'before': first[-1]['id']}).json()
        self.assertEqual(len(second), 3)
        self.assertFalse({p['id'] for p in first} & {p['id'] for p in second})

    def test_category_feed_only_shows_own_families(self):
        Post.objects.create_post('Eve xmas', '', self.eve, self.eves).categories.set([resolve_category('Christmas')])
        response = self.client.get(reverse('posts_by_category', args=['christmas']))
        self.assertEqual(response.json(), [])

    def test_category_slug_with_spaces(self):
        self.jones_post.categories.set([resolve_category('New Year')])
        response = self.client.get(reverse('posts_by_category', args=['new-year']))
        self.assertEqual(self.ids(response), {self.jones_post.id})

    def test_cannot_read_other_family_post_by_id(self):
        response = self.client.get(reverse('posts'), {'postId': self.eve_post.id})
        self.assertEqual(response.status_code, 404)

    def test_user_posts_limited_to_shared_families(self):
        self.client.force_login(self.bob)
        response = self.client.get(reverse('posts'), {'userId': str(self.alice.id)})
        self.assertEqual(self.ids(response), {self.smith_post.id})

    def test_cannot_post_into_family_you_are_not_in(self):
        response = self.client.post(reverse('posts'), {'familyId': self.eves.id, 'title': 'sneaky'})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Post.objects.filter(title='sneaky').exists())

    def test_create_post(self):
        response = self.client.post(reverse('posts'), {
            'familyId': self.smiths.id, 'title': 'Grandma\'s pie', 'description': 'recipe', 'category': 'Christmas'
        })
        self.assertEqual(response.status_code, 201, msg=response.content.decode())
        post = Post.objects.get(title="Grandma's pie")
        self.assertEqual([c.name for c in post.categories.all()], ['Christmas'])

    def test_cannot_like_or_comment_on_other_family_post(self):
        self.assertEqual(self.client.post(reverse('like_post', args=[self.eve_post.id])).status_code, 404)
        response = self.client.post(reverse('comments'), {'postId': self.eve_post.id, 'message': 'hi'})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.client.get(reverse('comments'), {'postId': self.eve_post.id}).status_code, 404)

    def test_like_toggles_and_reports(self):
        self.client.force_login(self.bob)
        self.client.post(reverse('like_post', args=[self.smith_post.id]))
        post = self.client.get(reverse('posts'), {'postId': self.smith_post.id}).json()
        self.assertEqual(post['likes_count'], 1)
        self.assertTrue(post['is_liked'])
        self.assertTrue(Notification.objects.filter(recipient=self.alice, notification_type='LIKE').exists())
        self.client.delete(reverse('like_post', args=[self.smith_post.id]))
        self.assertFalse(Notification.objects.filter(recipient=self.alice, notification_type='LIKE').exists())

    def test_comment_reply_notifies_parent_author_and_post_author(self):
        carol = make_user('carol@example.com', 'Carol')
        self.smiths.members.add(carol)
        parent = Comment.objects.create_comment('first', self.bob, self.smith_post)
        self.client.force_login(carol)
        response = self.client.post(reverse('comments'), {
            'postId': self.smith_post.id, 'message': 'reply', 'parentId': parent.id
        })
        self.assertEqual(response.status_code, 201)
        recipients = set(Notification.objects.filter(notification_type='COMMENT').values_list('recipient', flat=True))
        self.assertEqual(recipients, {self.alice.id, self.bob.id})

    def test_edit_and_delete_relic(self):
        self.client.force_login(self.bob)
        self.assertEqual(self.client.delete(reverse('post_detail', args=[self.smith_post.id])).status_code, 403)
        self.client.force_login(self.alice)
        response = self.client.patch(reverse('post_detail', args=[self.smith_post.id]),
                                     json.dumps({'title': 'Renamed'}), content_type='application/json')
        self.assertEqual(response.json()['title'], 'Renamed')
        self.assertEqual(self.client.delete(reverse('post_detail', args=[self.smith_post.id])).status_code, 200)

    def test_notification_detail_scoped_to_recipient(self):
        n = Notification.objects.create_notif('LIKE', self.alice, self.eve, post_mentioned=self.eve_post)
        response = self.client.get(reverse('notifications'), {'notificationId': n.id})
        self.assertEqual(response.status_code, 404)

    def test_profile_hidden_from_strangers(self):
        response = self.client.get(reverse('user_details_by_id'), {'userId': str(self.eve.id)})
        self.assertEqual(response.status_code, 404)
        response = self.client.get(reverse('user_details_by_id'), {'userId': str(self.bob.id)})
        self.assertEqual(response.status_code, 200)

    def test_search(self):
        response = self.client.get(reverse('search'), {'q': 'relic'}).json()
        self.assertEqual({r['id'] for r in response['relics']}, {self.smith_post.id, self.jones_post.id})
        response = self.client.get(reverse('search'), {'q': 'bob'}).json()
        self.assertEqual([p['first_name'] for p in response['people']], ['Bob'])
        response = self.client.get(reverse('search'), {'q': 'eve'}).json()
        self.assertEqual(response['people'], [])


class FamilyManagementTests(ThrottleResetMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.alice = make_user('alice@example.com', 'Alice')
        self.bob = make_user('bob@example.com', 'Bob')
        self.family = Family.objects.create_family('Smiths', '', creator=self.alice)

    def test_invite_code_is_strong(self):
        self.assertEqual(len(self.family.invite_code), 8)

    def test_join_with_code_case_insensitive(self):
        self.client.force_login(self.bob)
        response = self.client.post(reverse('join_family'), json.dumps({'inviteCode': self.family.invite_code.lower()}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.family.is_member(self.bob))
        self.assertTrue(Notification.objects.filter(recipient=self.alice, notification_type='GROUP_JOIN').exists())

    def test_only_creator_can_edit_settings(self):
        self.family.members.add(self.bob)
        self.client.force_login(self.bob)
        response = self.client.patch(reverse('update_family', args=[self.family.id]),
                                     json.dumps({'family_name': 'Hacked'}), content_type='application/json')
        self.assertEqual(response.status_code, 403)
        self.client.force_login(self.alice)
        old_code = self.family.invite_code
        response = self.client.patch(reverse('update_family', args=[self.family.id]),
                                     json.dumps({'family_name': 'Smith Family', 'regenerate_invite_code': True}),
                                     content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.family.refresh_from_db()
        self.assertEqual(self.family.family_name, 'Smith Family')
        self.assertNotEqual(self.family.invite_code, old_code)

    def test_remove_member(self):
        self.family.members.add(self.bob)
        self.client.force_login(self.alice)
        response = self.client.post(reverse('remove_family_member', args=[self.family.id]), {'userId': str(self.bob.id)})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.family.is_member(self.bob))

    def test_creator_leaving_hands_over_ownership(self):
        self.family.members.add(self.bob)
        self.client.force_login(self.alice)
        response = self.client.patch(reverse('leave_family'), json.dumps({'familyId': self.family.id}),
                                     content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.family.refresh_from_db()
        self.assertEqual(self.family.creator, self.bob)

    @mock.patch('api.views.cloudinary.uploader.upload')
    def test_upload_validation(self, upload):
        from django.core.files.uploadedfile import SimpleUploadedFile
        self.client.force_login(self.alice)
        bad = SimpleUploadedFile('x.txt', b'hello', content_type='text/plain')
        response = self.client.post(reverse('family'), {'family_name': 'Pics', 'family_picture': bad})
        self.assertEqual(response.status_code, 400)
        upload.assert_not_called()

        upload.return_value = {'public_id': 'family_pictures/abc'}
        good = SimpleUploadedFile('x.png', b'\x89PNG', content_type='image/png')
        response = self.client.post(reverse('family'), {'family_name': 'Pics', 'family_picture': good})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Family.objects.get(family_name='Pics').family_picture, 'family_pictures/abc')


class ConnectionTests(ThrottleResetMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.alice = make_user('alice@example.com', 'Alice')
        self.bob = make_user('bob@example.com', 'Bob')
        family = Family.objects.create_family('Smiths', '', creator=self.alice)
        family.members.add(self.bob)

    def test_request_decline_and_request_again(self):
        self.client.force_login(self.alice)
        self.assertEqual(self.client.post(reverse('send_connection_request'), {'userId': str(self.bob.id)}).status_code, 201)
        connection = Connection.objects.get()

        self.client.force_login(self.bob)
        response = self.client.patch(reverse('respond_to_connection_request'),
                                     json.dumps({'connectionId': connection.id, 'action': 'decline'}),
                                     content_type='application/json')
        self.assertEqual(response.status_code, 200)

        self.client.force_login(self.alice)
        self.assertEqual(self.client.post(reverse('send_connection_request'), {'userId': str(self.bob.id)}).status_code, 201)
        connection.refresh_from_db()
        self.assertEqual(connection.status, 'PENDING')

    def test_cannot_connect_with_self(self):
        self.client.force_login(self.alice)
        self.assertEqual(self.client.post(reverse('send_connection_request'), {'userId': str(self.alice.id)}).status_code, 400)


class NotificationManagerTestCase(TestCase):
    def setUp(self):
        self.sender = make_user('sender@example.com')
        self.recipient = make_user('recipient@example.com')
        self.family = Family.objects.create_family('family_name', 'family_description', creator=self.sender)
        self.post_mentioned = Post.objects.create_post('Title', 'Message', self.sender, self.family)

    def test_create_post_mention_notification(self):
        Notification.objects.create_post_mention_notification(self.sender, self.recipient, self.post_mentioned)
        notification = Notification.objects.get(sender=self.sender, recipient=self.recipient)
        self.assertEqual(notification.notification_type, 'POST_MENTION')

    def test_create_group_invitation_notification(self):
        Notification.objects.create_group_invitation_notification(self.sender, self.recipient)
        notification = Notification.objects.get(sender=self.sender, recipient=self.recipient)
        self.assertEqual(notification.notification_type, 'GROUP_INVITATION')

    def test_notification_list_and_count(self):
        Notification.objects.create_group_join_notification(self.sender, self.recipient, self.family)
        self.client.force_login(self.recipient)
        response = self.client.get(reverse('notifications'))
        self.assertEqual(response.json()[0]['family_details']['family_name'], 'family_name')
        self.assertEqual(self.client.get(reverse('notification_count')).json()['count'], 1)
        self.client.post(reverse('mark_all_notifications_read'))
        self.assertEqual(self.client.get(reverse('notification_count')).json()['count'], 0)
