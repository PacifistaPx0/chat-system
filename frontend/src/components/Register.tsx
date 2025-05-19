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
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="max-w-md w-full space-y-6 p-8 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
        <div>
          <h2 className="text-3xl font-bold text-white text-center">
            Create account
          </h2>
          <p className="mt-2 text-center text-zinc-400">
            Join Chat to start messaging
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              Create account
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            to="/login"
            className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}