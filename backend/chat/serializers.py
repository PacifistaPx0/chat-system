from rest_framework import serializers
from .models import ChatRoom, Message
from userauth.serializers import CustomUserSerializer

class MessageSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chatroom', 'user', 'content', 'timestamp', 'is_read']
        read_only_fields = ['timestamp', 'is_read']

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = CustomUserSerializer(many=True, source='users', read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'names', 'participants', 'created_at', 'updated_at', 'last_message']
        read_only_fields = ['created_at', 'updated_at']

    def get_last_message(self, obj):
        last_message = obj.messages.first()
        if last_message:
            return MessageSerializer(last_message).data
        return None