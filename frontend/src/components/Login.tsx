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
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="max-w-md w-full space-y-6 p-8 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
        <div>
          <h2 className="text-3xl font-bold text-white text-center">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-zinc-400">
            Sign in to continue to Chat
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
                type="email"
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            to="/register"
            className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}