import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { PageLoader } from '@/components/feedback/PageLoader';

/**
 * ProtectedRoute - blocks unauthenticated access
 * - shows loader while session rehydrates
 * - redirects to /login, preserving the attempted path for post-sign-in return
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageLoader />;
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
