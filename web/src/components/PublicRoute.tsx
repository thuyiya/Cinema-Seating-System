import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();

  // If user is authenticated and trying to access login page
  if (isAuthenticated) {
    // If user is admin, redirect to admin dashboard, otherwise to home
    return <Navigate to={isAdmin ? '/admin' : redirectTo} replace />;
  }

  return <>{children}</>;
} 