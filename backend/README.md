# README for the Backend of the Chat System

This project is a real-time chat system built using Django Rest Framework (DRF) for the backend and React for the frontend. 

## Project Structure

The backend consists of the following components:

- **chat_project**: The main Django project directory.
  - `__init__.py`: Marks the directory as a Python package.
  - `settings.py`: Contains the settings for the Django project, including database configuration and installed apps.
  - `urls.py`: Defines the URL patterns for the Django project.
  - `asgi.py`: Entry point for ASGI-compatible web servers.
  - `wsgi.py`: Entry point for WSGI-compatible web servers.

- **userauth**: The Django app responsible for user authentication.
  - `__init__.py`: Marks the directory as a Python package.
  - `admin.py`: Registers the models with the Django admin site.
  - `apps.py`: Contains the configuration for the userauth app.
  - `models.py`: Defines the data models for user authentication.
  - `serializers.py`: Contains serializers for converting model instances to JSON.
  - `urls.py`: Defines the URL patterns specific to the userauth app.
  - `views.py`: Contains views for handling user authentication requests.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd chat-system/backend
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Start the development server:
   ```
   python manage.py runserver
   ```

## Usage

You can access the API endpoints for user authentication at the following URLs:
- `/api/auth/login/`: Login endpoint
- `/api/auth/register/`: Registration endpoint

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.