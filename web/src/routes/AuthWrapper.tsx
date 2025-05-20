// AuthWrapper.tsx
import { Navigate, useLocation } from 'react-router-dom';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Check if user has selected seats before payment
  if (location.pathname === '/payment' && !location.state?.seats) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};