/**
 * API modules grouped by area
 */
import { api, tokenStore } from './client';
import type {
  Account,
  AuthSession,
  DashboardSummary,
  LoginPayload,
  Paginated,
  RegisterPayload,
  Transaction,
  TransactionQuery,
  UpdateProfilePayload,
  User,
} from '@/types';

/* ---- Auth -------------------------------------------------------------- */
export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthSession>('/auth/register', payload),
  login: (payload: LoginPayload) => api.post<AuthSession>('/auth/login', payload),
  logout: async () => {
    await api.post<void>('/auth/logout');
    tokenStore.clear();
  },
  me: () => api.get<User>('/auth/me'),
};

/* ---- Dashboard --------------------------------------------------------- */
export const dashboardApi = {
  get: () => api.get<DashboardSummary>('/dashboard'),
};

/* ---- Accounts ---------------------------------------------------------- */
export const accountsApi = {
  list: () => api.get<Account[]>('/accounts'),
  byId: (id: string) => api.get<Account>(`/accounts/${id}`),
};

/* ---- Transactions ------------------------------------------------------ */
function toQueryString(q: TransactionQuery): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const transactionsApi = {
  list: (q: TransactionQuery = {}) =>
    api.get<Paginated<Transaction>>(`/transactions${toQueryString(q)}`),
  byId: (id: string) => api.get<Transaction>(`/transactions/${id}`),
};

/* ---- Profile ----------------------------------------------------------- */
export const profileApi = {
  get: () => api.get<User>('/profile'),
  update: (payload: UpdateProfilePayload) => api.put<User>('/profile', payload),
};
