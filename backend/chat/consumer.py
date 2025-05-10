import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
from userauth.models import CustomUser

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.user = self.scope.get('user', None)

        # if not self.user or self.user.is_anonymous:
        #     await self.close()
        #     return

        # Get or create the chat room
        self.chat_room = await self.get_or_create_room(self.room_name)
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data['message']

            # Save message to database
            saved_message = await self.save_message(message)

            if saved_message:
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': self.user.username,
                        'user_id': self.user.id
                    }
                )
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except KeyError:
            print("Message key not found in data")
        except Exception as e:
            print(f"Error processing message: {str(e)}")

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'user_id': event['user_id']
        }))

    @database_sync_to_async
    def get_or_create_room(self, room_name):
        try:
            room, created = ChatRoom.objects.get_or_create(
                names=room_name,
                defaults={'names': room_name}
            )
            if created and self.user and not self.user.is_anonymous:
                room.users.add(self.user)
            return room
        except Exception as e:
            print(f"Error getting/creating room: {str(e)}")
            return None

    @database_sync_to_async
    def save_message(self, message_content):
        try:
            return Message.objects.create(
                chatroom=self.chat_room,
                user=self.user,
                content=message_content
            )
        except Exception as e:
            print(f"Error saving message: {str(e)}")
            return None

