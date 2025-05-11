from django.urls import re_path
from . import consumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>\d+)/$', consumer.ChatConsumer.as_asgi()),
    re_path(r'ws/status/$', consumer.UserStatusConsumer.as_asgi()),
]