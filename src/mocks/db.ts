/**
 * db - in-memory store seeded from JSON fixtures
 * - mutations persist for the page session (profile edits)
 * - resets to seed data on page reload
 */
import usersSeed from './data/users.json';
import accountsSeed from './data/accounts.json';
import transactionsSeed from './data/transactions.json';
import type { Account, Transaction } from '@/types';

type StoredUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  avatarUrl: string | null;
  createdAt: string;
}

type StoredAccount = Account & {
  userId: string;
}

export const db = {
  users: structuredClone(usersSeed) as StoredUser[],
  accounts: structuredClone(accountsSeed) as StoredAccount[],
  transactions: structuredClone(transactionsSeed) as Transaction[],
  sessions: new Map<string, string>(),
};

export function publicUser(user: StoredUser) {
  const { password: _password, ...rest } = user;
  return rest;
}

export function makeToken(userId: string): string {
  const token = `mock.${userId}.${crypto.randomUUID()}`;
  db.sessions.set(token, userId);
  return token;
}

export function userIdFromAuthHeader(header: string | null): string | null {
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length);
  return db.sessions.get(token) ?? null;
}
