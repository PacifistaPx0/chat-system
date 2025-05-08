from django.contrib import admin
from .models import ChatRoom, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0

class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('names', 'created_at', 'updated_at')
    inlines = [MessageInline]
    filter_horizontal = ('users',)

admin.site.register(ChatRoom, ChatRoomAdmin)
admin.site.register(Message)
