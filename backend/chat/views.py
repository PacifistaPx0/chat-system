from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from userauth.models import CustomUser
from userauth.serializers import CustomUserSerializer

# Create your views here.

class ChatRoomListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(users=self.request.user)

    def perform_create(self, serializer):
        names = self.request.data.get('names', 'New Chat')
        chat_room = serializer.save(names=names)
        
        # Add the current user and the selected users to the chat room
        user_ids = self.request.data.get('user_ids', [])
        users = list(CustomUser.objects.filter(id__in=user_ids))
        users.append(self.request.user)
        chat_room.users.add(*users)

class ChatRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return ChatRoom.objects.filter(users=self.request.user)

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        chatroom_id = self.kwargs.get('chatroom_id')
        return Message.objects.filter(chatroom_id=chatroom_id)

    def perform_create(self, serializer):
        chatroom_id = self.kwargs.get('chatroom_id')
        serializer.save(
            user=self.request.user,
            chatroom_id=chatroom_id
        )

class ChatUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all users except the current user
        users = CustomUser.objects.exclude(id=request.user.id)
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)

class MarkMessagesAsRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chatroom_id):
        # Mark all unread messages in the chatroom that were not sent by the current user
        Message.objects.filter(
            chatroom_id=chatroom_id,
            user__in=CustomUser.objects.exclude(id=request.user.id),
            is_read=False
        ).update(is_read=True)
        return Response(status=status.HTTP_200_OK)
