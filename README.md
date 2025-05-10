# Real-Time Chat System

A full-stack real-time chat application built with Django Channels and React.

## Features

- Real-time messaging using WebSocket connections
- User authentication and authorization
- Multiple chat rooms support
- Message history persistence
- User online/offline status
- Unread message indicators
- Responsive UI using Tailwind CSS

## Tech Stack

### Backend
- Django
- Django REST Framework
- Django Channels
- Redis (for WebSocket channel layers)
- SQLite (database)

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite
- React Router

## Prerequisites

- Python 3.8+
- Node.js 14+
- Redis Server
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-system
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

3. Set up the frontend:
```bash
cd ../frontend
npm install
```

4. Create environment files:

Backend (.env):
```env
DEBUG=True
SECRET_KEY=your_secret_key
ALLOWED_HOSTS=localhost,127.0.0.1
```

Frontend (.env):
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Running the Application

1. Start Redis Server:
```bash
redis-server
```

2. Start the Django development server with Daphne (for WebSocket support):
```bash
cd backend
daphne chat_project.asgi:application
```

3. Start the Django API server (in a new terminal):
```bash
cd backend
python manage.py runserver
```

4. Start the Vite development server:
```bash
cd frontend
npm run dev
```

5. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- WebSocket Server: ws://localhost:8000
- Django Admin: http://localhost:8000/admin

Note: Running both Daphne and the Django development server allows us to handle both WebSocket connections and regular HTTP requests. Daphne handles the WebSocket connections while the Django development server handles the REST API endpoints.

## API Endpoints

### Authentication
- `POST /userauth/register/`: Register a new user
- `POST /userauth/login/`: Login user
- `POST /userauth/logout/`: Logout user
- `GET /userauth/profile/`: Get user profile

### Chat
- `GET /chat/rooms/`: List all chat rooms
- `POST /chat/rooms/`: Create a new chat room
- `GET /chat/rooms/<id>/`: Get chat room details
- `GET /chat/rooms/<id>/messages/`: Get room messages
- `POST /chat/rooms/<id>/messages/`: Send a message
- `GET /chat/users/`: List available users
- `POST /chat/rooms/<id>/read/`: Mark messages as read

## WebSocket Connection

WebSocket endpoints follow this pattern:
```
ws://localhost:8000/ws/chat/<room_name>/
```

Messages should be sent in JSON format:
```json
{
  "message": "Hello, World!"
}
```

## Testing

Run backend tests:
```bash
cd backend
python manage.py test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Django Channels documentation
- React documentation
- Tailwind CSS documentation