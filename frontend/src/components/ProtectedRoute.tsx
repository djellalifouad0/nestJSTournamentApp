import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  // Also check localStorage directly to handle the initial render race condition
  const hasToken = !!localStorage.getItem('token');

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
