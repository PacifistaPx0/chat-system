from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('userauth/', include('userauth.urls')),
    path('chat/', include('chat.urls')),
]