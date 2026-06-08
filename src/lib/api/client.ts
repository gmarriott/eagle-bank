import type { ApiError } from '@/types';

/**
 * api - thin fetch wrapper used by all API modules
 * - attaches auth token and normalises errors to typed ApiError
 * - intercepted by MSW in app - if ever deployed base url would updated
 */

const TOKEN_KEY = 'eaglebank.token';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class HttpError extends Error implements ApiError {
  status: number;
  fields?: Record<string, string>;
  constructor(error: ApiError) {
    super(error.message);
    this.name = 'HttpError';
    this.status = error.status;
    this.fields = error.fields;
  }
}

const BASE_URL = '/api';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    // Network-level failure (offline, DNS, etc.)
    throw new HttpError({ status: 0, message: 'Network error. Please check your connection.' });
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new HttpError({
      status: response.status,
      message: (data as ApiError).message ?? 'Something went wrong.',
      fields: (data as ApiError).fields,
    });
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
};
