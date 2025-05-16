/**
 * Register Component
 * Handles new user registration with form validation
 * Features:
 * - Username, email, and password input fields
 * - Password confirmation
 * - Client-side validation
 * - Error handling and display
 * - Integration with AuthContext for registration
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  // State management for form fields and error handling
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  
  // Get register function from authentication context
  const { register } = useAuth();

  /**
   * Updates form data state as user types
   * @param e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Validates form data and submits registration
   * - Ensures all fields are filled
   * - Handles registration errors
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full space-y-8 p-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
        <div>
          <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-3 text-center text-gray-400">
            Join Chat Sphere today
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
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800/50 placeholder-gray-500 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800/50 placeholder-gray-500 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800/50 placeholder-gray-500 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800/50 placeholder-gray-500 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800/50 placeholder-gray-500 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 ease-in-out"
            >
              Create Account
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link 
            to="/login" 
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}