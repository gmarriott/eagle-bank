import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/queryClient';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { IconArrowDown, IconArrowUp } from '@/components/layout/icons';
import { formatMoney, formatSignedMoney, formatDate } from '@/lib/format';
import type { Transaction } from '@/types';

function StatCard({
  label,
  value,
  loading,
  tone,
}: {
  label: string;
  value?: string;
  loading: boolean;
  tone?: 'positive' | 'negative';
}) {
  const valueColor =
    tone === 'positive'
      ? 'text-positive-text'
      : tone === 'negative'
        ? 'text-negative-text'
        : '';

  return (
    <Card className="flex flex-col gap-2">
      <span className="text-sm text-text-muted">{label}</span>
      {loading ? (
        <Skeleton width="60%" height={28} />
      ) : (
        <span className={['text-2xl font-medium mono', valueColor].filter(Boolean).join(' ')}>
          {value}
        </span>
      )}
    </Card>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const credit = transaction.amountMinor > 0;
  return (
    <li className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
      <span
        className={[
          'w-9 h-9 rounded-pill grid place-items-center shrink-0',
          credit ? 'bg-positive-bg text-positive-text' : 'bg-surface-sunken text-text-muted',
        ].join(' ')}
        aria-hidden
      >
        {credit ? <IconArrowDown /> : <IconArrowUp />}
      </span>
      <span className="flex flex-col flex-1 min-w-0">
        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {transaction.description}
        </span>
        <span className="text-xs text-text-muted">{formatDate(transaction.date)}</span>
      </span>
      <span
        className={['font-medium text-sm mono', credit ? 'text-positive-text' : 'text-text'].join(' ')}
      >
        {formatSignedMoney(transaction.amountMinor)}
      </span>
    </li>
  );
}

const QUICK_ACTIONS = [
  { to: '/transactions', label: 'View transactions' },
  { to: '/accounts', label: 'Manage accounts' },
  { to: '/profile', label: 'Update profile' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardApi.get,
  });

  const firstName = user?.fullName.split(' ')[0] ?? 'there';

  return (
    <>
      <PageHeader
        topTitle="Overview"
        title={
          <>
            Good to see you, <span className="text-primary">{firstName}</span>
          </>
        }
        description="Here's your account overview."
      />

      {isError ? (
        <Card>
          <ErrorState message="We couldn't load your dashboard." onRetry={() => void refetch()} />
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4 stagger max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {/* Hero */}
          <Card className="col-span-3 border-0 flex flex-col gap-2 relative overflow-hidden text-text-inverse max-[900px]:col-span-2 max-[560px]:col-span-1 after:content-[''] after:absolute after:right-[-40px] after:top-[-40px] after:w-[220px] after:h-[220px] after:bg-[radial-gradient(circle,rgba(194,136,78,0.25),transparent_70%)]"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="text-sm text-black">Total balance</span>
            {isLoading ? (
              <Skeleton width="50%" height={44} />
            ) : (
              <span className="text-4xl font-medium tracking-[-0.02em] text-black">
                {formatMoney(data!.totalBalanceMinor)}
              </span>
            )}
          </Card>

          <StatCard
            label="Current balance"
            value={data && formatMoney(data.totalBalanceMinor)}
            loading={isLoading}
          />
          <StatCard
            label="Monthly deposits"
            value={data && formatSignedMoney(data.monthlyDepositsMinor)}
            loading={isLoading}
            tone="positive"
          />
          <StatCard
            label="Monthly withdrawals"
            value={data && formatSignedMoney(data.monthlyWithdrawalsMinor)}
            loading={isLoading}
            tone="negative"
          />

          {/* Recent transactions */}
          <Card
            as="section"
            className="col-span-2 max-[900px]:col-span-2 max-[560px]:col-span-1"
            aria-labelledby="recent-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-heading" className="text-lg">
                Recent transactions
              </h2>
              <Link to="/transactions" className="text-sm text-primary font-semibold hover:underline">
                See all →
              </Link>
            </div>
            {isLoading ? (
              <ul role="list" className="flex flex-col">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
                    <Skeleton width={36} height={36} radius="999px" />
                    <Skeleton width="50%" height={14} />
                    <Skeleton width={70} height={14} />
                  </li>
                ))}
              </ul>
            ) : data && data.recentTransactions.length > 0 ? (
              <ul role="list" className="flex flex-col">
                {data.recentTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No transactions yet"
                description="When a transaction is made it will appear here"
              />
            )}
          </Card>

          {/* Quick actions */}
          <Card
            as="section"
            className="col-span-1 max-[900px]:col-span-2 max-[560px]:col-span-1"
            aria-labelledby="quick-heading"
          >
            <h2 id="quick-heading" className="text-lg">
              Quick actions
            </h2>
            <div className="flex flex-col gap-2 mt-4">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center justify-between py-3 px-4 rounded-md bg-surface-sunken font-medium text-sm transition-[background-color] duration-[120ms] ease-[var(--ease-out)] hover:bg-border"
                >
                  {a.label}
                  <span aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
