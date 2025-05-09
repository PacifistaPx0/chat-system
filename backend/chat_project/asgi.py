import os
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

# Set the settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.getenv("DJANGO_SETTINGS_MODULE", "chat_project.settings"))

# Initialize Django ASGI application first (important for model loading!)
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

# Now safely import channels-related modules (AFTER app registry is ready)
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from chat.routing import websocket_urlpatterns  # <-- safe now

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})

