from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.exceptions import NotAuthenticated
from rest_framework.authentication import get_authorization_header
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from userauth.models import CustomUser
from userauth.serializers import CustomUserSerializer

# Create your views here.

def get_authorization_error_response():
    return Response(
        {'detail': 'Authentication credentials were not provided.'}, 
        status=status.HTTP_401_UNAUTHORIZED
    )

class ChatRoomListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]

    def permission_denied(self, request, message=None, code=None):
        if not request.successful_authenticator:
            raise NotAuthenticated()
        super().permission_denied(request, message, code)

    def get_queryset(self):
        return ChatRoom.objects.filter(users=self.request.user)

    def create(self, request, *args, **kwargs):
        names = request.data.get('names', 'New Chat')
        serializer = self.get_serializer(data={'names': names})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        chat_room = serializer.save()
        # Add the current user and the selected users to the chat room
        user_ids = self.request.data.get('user_ids', [])
        users = list(CustomUser.objects.filter(id__in=user_ids))
        users.append(self.request.user)
        chat_room.users.add(*users)

class ChatRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def permission_denied(self, request, message=None, code=None):
        if not request.successful_authenticator:
            raise NotAuthenticated()
        super().permission_denied(request, message, code)

    def get_queryset(self):
        return ChatRoom.objects.filter(users=self.request.user)

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def permission_denied(self, request, message=None, code=None):
        if not request.successful_authenticator:
            raise NotAuthenticated()
        super().permission_denied(request, message, code)

    def get_queryset(self):
        chatroom_id = self.kwargs.get('chatroom_id')
        # Get the last 50 messages, ordered by timestamp
        return Message.objects.filter(
            chatroom_id=chatroom_id
        ).select_related('user').order_by('-timestamp')[:50]

    def create(self, request, *args, **kwargs):
        chatroom_id = self.kwargs.get('chatroom_id')
        try:
            chatroom = ChatRoom.objects.get(id=chatroom_id, users=request.user)
        except ChatRoom.DoesNotExist:
            return Response(
                {'error': 'Chat room not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data.copy()
        data['chatroom'] = chatroom_id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def permission_denied(self, request, message=None, code=None):
        if not request.successful_authenticator:
            raise NotAuthenticated()
        super().permission_denied(request, message, code)

    def get(self, request):
        # Get all users except the current user
        users = CustomUser.objects.exclude(id=request.user.id)
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)

class MarkMessagesAsRead(APIView):
    permission_classes = [IsAuthenticated]

    def permission_denied(self, request, message=None, code=None):
        if not request.successful_authenticator:
            raise NotAuthenticated()
        super().permission_denied(request, message, code)

    def post(self, request, chatroom_id):
        # Mark all unread messages in the chatroom that were not sent by the current user
        Message.objects.filter(
            chatroom_id=chatroom_id,
            user__in=CustomUser.objects.exclude(id=request.user.id),
            is_read=False
        ).update(is_read=True)
        return Response(status=status.HTTP_200_OK)
