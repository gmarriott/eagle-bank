import { QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';

/**
 *  ErrorBoundary - catches render-time crashes anywhere below
 *  QueryClient - server-state cache (TanStack Query)
 *  HashRouter - routing (hash-based for GitHub Pages compatibility)
 *  AuthProvider - session/auth context (needs router hooks for redirects)
 */
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </HashRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
