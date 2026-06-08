/**
 * Domain types - shared contract between the mock API layer and the UI
 * - single source of truth for data structure
 */

export type AccountType = 'savings' | 'credit';
export type AccountStatus = 'active' | 'closed';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string | null;
  createdAt: string;
}

export type Account = {
  id: string;
  accountNumber: string;
  type: AccountType;
  status: AccountStatus;
  availableBalanceMinor: number;
  currency: 'GBP';
}

export type Transaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  status: TransactionStatus;
  amountMinor: number;
  currency: 'GBP';
  description: string;
  counterparty: string;
  date: string;
}

export type DashboardSummary = {
  totalBalanceMinor: number;
  monthlyDepositsMinor: number;
  monthlyWithdrawalsMinor: number;
  recentTransactions: Transaction[];
  currency: 'GBP';
}

/*  Auth payloads */

export type AuthSession = {
  token: string;
  user: User;
}

export type LoginPayload = {
  email: string;
  password: string;
}

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export type UpdateProfilePayload = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl?: string | null;
}

/*  Paginated list  */

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type TransactionQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: 'date' | 'amount';
  sortDir?: 'asc' | 'desc';
  from?: string;
  to?: string;
  accountId?: string;
}

/** Shape every mock endpoint uses for failures, mirroring a real API. */
export type ApiError = {
  status: number;
  message: string;
  fields?: Record<string, string>;
}
