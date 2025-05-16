/**
 * Login Component
 * Provides a user interface for authentication
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  // State management for form fields and error handling
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Get login function from authentication context
  const { login } = useAuth();

  /**
   * Handles form submission
   * Prevents default form behavior and attempts to log in
   * Displays error message if login fails
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full space-y-8 p-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
        <div>
          <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-3 text-center text-gray-400">
            Sign in to continue to Chat Sphere
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800/50 placeholder-gray-500 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800/50 placeholder-gray-500 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 ease-in-out"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link 
            to="/register" 
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}