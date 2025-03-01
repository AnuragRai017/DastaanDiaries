import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <LoadingSpinner size="lg" />
    </div>;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role (case insensitive)
  const userRole = (user.role || '').toLowerCase();
  if (userRole !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
