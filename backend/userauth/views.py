from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CustomUserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        login(self.request, user)

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Please provide both email and password'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            serializer = CustomUserSerializer(user)
            return Response(serializer.data)
        else:
            return Response({'error': 'Invalid credentials'},
                          status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'detail': 'Successfully logged out.'}, 
                       status=status.HTTP_200_OK)

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer
    
    def get_object(self):
        return self.request.user