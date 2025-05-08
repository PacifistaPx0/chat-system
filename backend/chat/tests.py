from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer

User = get_user_model()

class ChatModelsTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        self.chatroom = ChatRoom.objects.create(names='Test Room')
        self.chatroom.users.add(self.user1, self.user2)

    def test_chatroom_creation(self):
        """Test ChatRoom model"""
        self.assertEqual(self.chatroom.users.count(), 2)
        self.assertTrue(self.chatroom.created_at)
        self.assertTrue(self.chatroom.updated_at)

    def test_message_creation(self):
        """Test Message model"""
        message = Message.objects.create(
            chatroom=self.chatroom,
            user=self.user1,
            content='Hello, this is a test message'
        )
        self.assertEqual(message.content, 'Hello, this is a test message')
        self.assertEqual(message.user, self.user1)
        self.assertFalse(message.is_read)
        self.assertTrue(message.timestamp)

class ChatSerializersTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        self.chatroom = ChatRoom.objects.create(names='Test Chat')
        self.chatroom.users.add(self.user1, self.user2)
        self.message = Message.objects.create(
            chatroom=self.chatroom,
            user=self.user1,
            content='Test message'
        )

    def test_chatroom_serializer(self):
        """Test ChatRoom serializer"""
        serializer = ChatRoomSerializer(self.chatroom)
        self.assertIn('participants', serializer.data)
        self.assertIn('last_message', serializer.data)
        self.assertEqual(len(serializer.data['participants']), 2)
        self.assertEqual(serializer.data['names'], 'Test Chat')

    def test_message_serializer(self):
        """Test Message serializer"""
        serializer = MessageSerializer(self.message)
        self.assertEqual(serializer.data['content'], 'Test message')
        self.assertIn('user', serializer.data)
        self.assertFalse(serializer.data['is_read'])

class ChatViewsTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        # Create token for user1
        self.token = Token.objects.create(user=self.user1)
        # Authenticate with token
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.chatroom = ChatRoom.objects.create(names='Test Room')
        self.chatroom.users.add(self.user1, self.user2)

    def test_create_chatroom(self):
        """Test creating a new chat room"""
        url = reverse('chatroom-list')
        data = {
            'names': 'New Test Room',
            'user_ids': [self.user2.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        new_room_id = response.data['id']
        chatroom = ChatRoom.objects.get(id=new_room_id)
        self.assertEqual(chatroom.names, 'New Test Room')

    def test_list_chatrooms(self):
        """Test listing chat rooms"""
        url = reverse('chatroom-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_message(self):
        """Test creating a new message"""
        url = reverse('message-list', kwargs={'chatroom_id': self.chatroom.id})
        data = {'content': 'Test message'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(Message.objects.first().content, 'Test message')

    def test_list_messages(self):
        """Test listing messages in a chat room"""
        Message.objects.create(
            chatroom=self.chatroom,
            user=self.user1,
            content='Test message'
        )
        url = reverse('message-list', kwargs={'chatroom_id': self.chatroom.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_mark_messages_as_read(self):
        """Test marking messages as read"""
        message = Message.objects.create(
            chatroom=self.chatroom,
            user=self.user2,
            content='Test message'
        )
        self.assertFalse(message.is_read)
        url = reverse('mark-messages-read', kwargs={'chatroom_id': self.chatroom.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        message.refresh_from_db()
        self.assertTrue(message.is_read)

    def test_get_chat_users(self):
        """Test getting available users to chat with"""
        url = reverse('chat-users')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should only return user2 (not self)

    def test_unauthorized_access(self):
        """Test unauthorized access to chat endpoints"""
        # Remove token authentication
        self.client.credentials()
        urls = [
            reverse('chatroom-list'),
            reverse('message-list', kwargs={'chatroom_id': self.chatroom.id}),
            reverse('chat-users'),
            reverse('mark-messages-read', kwargs={'chatroom_id': self.chatroom.id})
        ]
        for url in urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_chatroom_detail(self):
        """Test retrieving a specific chat room"""
        url = reverse('chatroom-detail', kwargs={'id': self.chatroom.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.chatroom.id)
