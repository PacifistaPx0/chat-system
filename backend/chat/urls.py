from django.urls import path
from .views import (
    ChatRoomListCreateView,
    ChatRoomDetailView,
    MessageListCreateView,
    ChatUsersView,
    MarkMessagesAsRead
)

urlpatterns = [
    path('rooms/', ChatRoomListCreateView.as_view(), name='chatroom-list'),
    path('rooms/<str:name>/', ChatRoomDetailView.as_view(), name='chatroom-detail'),
    path('rooms/<str:room_name>/messages/', MessageListCreateView.as_view(), name='message-list'),
    path('users/', ChatUsersView.as_view(), name='chat-users'),
    path('rooms/<str:room_name>/read/', MarkMessagesAsRead.as_view(), name='mark-messages-read'),
]