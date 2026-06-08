import { QueryClient } from '@tanstack/react-query';
import { HttpError } from './api/client';

/**
 * Central React Query configuration.
 * - `staleTime` of 30s prevents redundant refetches as the user navigates.
 * - We do NOT retry 4xx errors (auth/validation failures won't fix themselves)
 *   but we do retry transient 5xx/network errors once.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: { retry: false },
  },
});

/** Stable query keys — one place so cache invalidation never typos a string. */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  dashboard: ['dashboard'] as const,
  accounts: ['accounts'] as const,
  account: (id: string) => ['accounts', id] as const,
  transactions: (params: unknown) => ['transactions', params] as const,
  transaction: (id: string) => ['transactions', id] as const,
  profile: ['profile'] as const,
};
