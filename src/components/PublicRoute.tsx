import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user } = useAuth();

  // If user is authenticated, redirect based on role
  if (user) {
    console.log("PublicRoute detected authenticated user with role:", user.role);
    // Redirect admin users to admin dashboard, regular users to user dashboard
    if (user.role?.toLowerCase() === 'admin') {
      console.log("PublicRoute redirecting admin to /admin");
      return <Navigate to="/admin" replace />;
    } else {
      console.log("PublicRoute redirecting user to /dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
