from django.db import models
from userauth.models import CustomUser

class ChatRoom(models.Model):
    names = models.CharField(max_length=255)
    users = models.ManyToManyField(CustomUser, related_name="chatrooms")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.name}'

class Message(models.Model):
    chatroom = models.ForeignKey(ChatRoom, related_name="messages", on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, related_name="messages", on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.user.email}: {self.content} [{self.timestamp}]'

