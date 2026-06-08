/**
 * MSW request handlers - mocked backend for development
 * - mimicks real endpoints with auth validation and realistic status codes
 * - simulates latency so loading states can be visible
 */
import { http, HttpResponse, delay } from 'msw';
import { db, makeToken, publicUser, userIdFromAuthHeader } from './db';
import type {
  ApiError,
  DashboardSummary,
  LoginPayload,
  Paginated,
  RegisterPayload,
  Transaction,
  UpdateProfilePayload,
} from '@/types';

const LATENCY = 450; // latency in ms — enough to see skeletons

function unauthorized(): HttpResponse<ApiError> {
  return HttpResponse.json<ApiError>(
    { status: 401, message: 'Your session has expired. Please sign in again.' },
    { status: 401 },
  );
}

function requireUser(request: Request) {
  const userId = userIdFromAuthHeader(request.headers.get('Authorization'));
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) ?? null;
}

function startOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

export const handlers = [
  /* ---- AUTH ---------------------------------------------------------- */
  http.post('/api/auth/register', async ({ request }) => {
    await delay(LATENCY);
    const body = (await request.json()) as RegisterPayload;
    const fields: Record<string, string> = {};
    if (!body.fullName?.trim()) fields.fullName = 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(body.email ?? '')) fields.email = 'Enter a valid email.';
    if ((body.password ?? '').length < 8)
      fields.password = 'Password must be at least 8 characters.';
    if (db.users.some((u) => u.email === body.email))
      fields.email = 'An account with this email already exists.';

    if (Object.keys(fields).length) {
      return HttpResponse.json<ApiError>(
        { status: 422, message: 'Please correct the highlighted fields.', fields },
        { status: 422 },
      );
    }

    const user = {
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      fullName: body.fullName.trim(),
      email: body.email,
      phone: body.phone ?? '',
      address: '',
      password: body.password,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    const token = makeToken(user.id);
    return HttpResponse.json({ token, user: publicUser(user) }, { status: 201 });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(LATENCY);
    const body = (await request.json()) as LoginPayload;
    const user = db.users.find((u) => u.email === body.email);
    if (!user || user.password !== body.password) {
      return HttpResponse.json<ApiError>(
        { status: 401, message: 'Incorrect email or password.' },
        { status: 401 },
      );
    }
    const token = makeToken(user.id);
    return HttpResponse.json({ token, user: publicUser(user) });
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    await delay(150);
    const header = request.headers.get('Authorization');
    if (header?.startsWith('Bearer ')) db.sessions.delete(header.slice(7));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await delay(200);
    const user = requireUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json(publicUser(user));
  }),

  /* ---- DASHBOARD ----------------------------------------------------- */
  http.get('/api/dashboard', async ({ request }) => {
    await delay(LATENCY);
    const user = requireUser(request);
    if (!user) return unauthorized();

    const accounts = db.accounts.filter((a) => a.userId === user.id);
    const transactions = db.transactions
      .filter((t) => accounts.some((a) => a.id === t.accountId))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));

    const monthStart = startOfMonth();
    const thisMonth = transactions.filter((t) => +new Date(t.date) >= monthStart);

    const summary: DashboardSummary = {
      currency: 'GBP',
      totalBalanceMinor: accounts.reduce((sum, a) => sum + a.availableBalanceMinor, 0),
      monthlyDepositsMinor: thisMonth
        .filter((t) => t.amountMinor > 0)
        .reduce((sum, t) => sum + t.amountMinor, 0),
      monthlyWithdrawalsMinor: thisMonth
        .filter((t) => t.amountMinor < 0)
        .reduce((sum, t) => sum + t.amountMinor, 0),
      recentTransactions: transactions.slice(0, 5),
    };
    return HttpResponse.json(summary);
  }),

  /* ---- ACCOUNTS ------------------------------------------------------ */
  http.get('/api/accounts', async ({ request }) => {
    await delay(LATENCY);
    const user = requireUser(request);
    if (!user) return unauthorized();
    const accounts = db.accounts
      .filter((a) => a.userId === user.id)
      .map(({ userId: _userId, ...rest }) => rest);
    return HttpResponse.json(accounts);
  }),

  http.get('/api/accounts/:id', async ({ request, params }) => {
    await delay(300);
    const user = requireUser(request);
    if (!user) return unauthorized();
    const account = db.accounts.find((a) => a.id === params.id && a.userId === user.id);
    if (!account) {
      return HttpResponse.json<ApiError>(
        { status: 404, message: 'Account not found.' },
        { status: 404 },
      );
    }
    const { userId: _userId, ...rest } = account;
    return HttpResponse.json(rest);
  }),

  /* ---- TRANSACTIONS -------------------------------------------------- */
  http.get('/api/transactions', async ({ request }) => {
    await delay(LATENCY);
    const user = requireUser(request);
    if (!user) return unauthorized();

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const pageSize = Math.min(50, Number(url.searchParams.get('pageSize') ?? '10'));
    const sortBy = (url.searchParams.get('sortBy') ?? 'date') as 'date' | 'amount';
    const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const accountId = url.searchParams.get('accountId');

    const accounts = db.accounts.filter((a) => a.userId === user.id);
    let rows = db.transactions.filter((t) => accounts.some((a) => a.id === t.accountId));

    if (accountId) rows = rows.filter((t) => t.accountId === accountId);
    if (from) rows = rows.filter((t) => +new Date(t.date) >= +new Date(from));
    if (to) rows = rows.filter((t) => +new Date(t.date) <= +new Date(`${to}T23:59:59`));

    rows.sort((a, b) => {
      const comparison =
        sortBy === 'amount'
          ? a.amountMinor - b.amountMinor
          : +new Date(a.date) - +new Date(b.date);
      return sortDir === 'asc' ? comparison : -comparison;
    });

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const result: Paginated<Transaction> = {
      items: rows.slice(start, start + pageSize),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
    return HttpResponse.json(result);
  }),

  http.get('/api/transactions/:id', async ({ request, params }) => {
    await delay(250);
    const user = requireUser(request);
    if (!user) return unauthorized();
    const accounts = db.accounts.filter((a) => a.userId === user.id);
    const transaction = db.transactions.find(
      (t) => t.id === params.id && accounts.some((a) => a.id === t.accountId),
    );
    if (!transaction) {
      return HttpResponse.json<ApiError>(
        { status: 404, message: 'Transaction not found.' },
        { status: 404 },
      );
    }
    return HttpResponse.json(transaction);
  }),

  /* ---- PROFILE ------------------------------------------------------- */
  http.get('/api/profile', async ({ request }) => {
    await delay(300);
    const user = requireUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json(publicUser(user));
  }),

  http.put('/api/profile', async ({ request }) => {
    await delay(LATENCY);
    const user = requireUser(request);
    if (!user) return unauthorized();
    const body = (await request.json()) as UpdateProfilePayload;

    const fields: Record<string, string> = {};
    if (!body.fullName?.trim()) fields.fullName = 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(body.email ?? '')) fields.email = 'Enter a valid email.';
    if (Object.keys(fields).length) {
      return HttpResponse.json<ApiError>(
        { status: 422, message: 'Please correct the highlighted fields.', fields },
        { status: 422 },
      );
    }

    user.fullName = body.fullName.trim();
    user.email = body.email;
    user.phone = body.phone;
    user.address = body.address;
    if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl;
    return HttpResponse.json(publicUser(user));
  }),
];