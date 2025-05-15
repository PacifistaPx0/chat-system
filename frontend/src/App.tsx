/**
 * App Component - Root component of the application
 * Sets up:
 * - Routing configuration
 * - Authentication provider
 * - Protected and public routes
 * 
 * Route Structure:
 * - /login: Public route for user authentication
 * - /register: Public route for new user registration
 * - /chat: Protected route for the chat interface
 * - /: Redirects to /chat
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

function App() {
  return (
    <Router>
      {/* Wrap entire app with AuthProvider for authentication context */}
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected chat route */}
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          
          {/* Redirect root to chat */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
