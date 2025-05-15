/**
 * Authentication Context Provider
 * Manages global authentication state and provides authentication-related functionality
 * throughout the application using React Context
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Type definitions for user data
interface User {
  id: number;
  username: string;
  email: string;
}

// Type definition for the Authentication Context
interface AuthContextType {
  user: User | null;         // Current authenticated user or null if not authenticated
  loading: boolean;          // Loading state for authentication operations
  login: (email: string, password: string) => Promise<void>;    // Login function
  register: (userData: any) => Promise<void>;                   // Registration function
  logout: () => Promise<void>;                                  // Logout function
  checkAuth: () => Promise<void>;                              // Auth status check function
}

// Create the context with null as initial value
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Helper function to get cookie value by name
 * Used primarily for CSRF token handling
 */
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

/**
 * Authentication Provider Component
 * Wraps the application and provides authentication state and methods
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State management for user and loading status
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status when app loads
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verifies the current authentication status
   * Fetches user profile if authenticated
   */
  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/userauth/profile/', {
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user login
   * 1. Fetches CSRF token
   * 2. Submits login credentials
   * 3. Updates user state on success
   * 4. Navigates to chat on success
   */
  const login = async (email: string, password: string) => {
    try {
      // First, get the CSRF token
      await fetch('http://localhost:8000/userauth/csrf/', { 
        credentials: 'include'
      });
      
      // Now make the login request with the CSRF token
      const response = await fetch('http://localhost:8000/userauth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
      });
      
      navigate('/chat');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Handles user registration
   * 1. Fetches CSRF token
   * 2. Submits registration data
   * 3. Updates user state on success
   * 4. Navigates to chat on success
   */
  const register = async (userData: any) => {
    try {
      // First, get the CSRF token
      await fetch('http://localhost:8000/userauth/csrf/', { 
        credentials: 'include'
      });
      
      // Now make the register request with the CSRF token
      const response = await fetch('http://localhost:8000/userauth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
      });
      
      navigate('/chat');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  /**
   * Handles user logout
   * Sends a logout request to the server
   */
  const logout = async () =>{
    try {
      const response = await fetch("http://localhost:8000/userauth/logout/", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CRSFToken': getCookie('crsftoken') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('logout error', error);
    }
    
  };

  if (loading) {
    return <div>Loading...</div>; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout , checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the AuthContext
 * Ensures the hook is used within an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};