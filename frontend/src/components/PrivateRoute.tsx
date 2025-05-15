/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Features:
 * - Redirects unauthenticated users to login page
 * - Shows loading state while checking authentication
 * - Renders protected content only for authenticated users
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Props type definition
interface PrivateRouteProps {
  children: React.ReactNode;  // The protected route content
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  // Get authentication state and loading status
  const { user, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Render protected content if user is authenticated
  return <>{children}</>;
}