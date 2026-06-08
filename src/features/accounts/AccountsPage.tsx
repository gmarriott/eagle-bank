import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/queryClient';
import { Badge, Card, EmptyState, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { IconEye, IconEyeOff } from '@/components/layout/icons';
import { formatMoney } from '@/lib/format';
import type { Account, AccountStatus } from '@/types';

const STATUS_TONE: Record<AccountStatus, 'positive' | 'warning'> = {
  active: 'positive',
  closed: 'warning',
};

const TYPE_LABEL: Record<Account['type'], string> = {
  savings: 'Savings',
  credit: 'Credit',
};

function maskAccountNumber(full: string) {
  const parts = full.split(' ');
  return parts.map((p, i) => (i < parts.length - 1 ? '••••' : p)).join(' ');
}

function AccountCard({ account }: { account: Account }) {
  const [revealed, setRevealed] = useState(false);
  const isDebt = account.availableBalanceMinor < 0;
  const displayNumber = revealed ? account.accountNumber : maskAccountNumber(account.accountNumber);

  return (
    <Card
      interactive
      as="article"
      className="flex flex-col gap-3 min-h-[180px]"
      aria-label={`${TYPE_LABEL[account.type]} account ending ${account.accountNumber.slice(-4)}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.06em] text-text-muted">
          {TYPE_LABEL[account.type]}
        </span>
        <Badge tone={STATUS_TONE[account.status]}>{account.status}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg tracking-[0.08em] text-text mono">{displayNumber}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setRevealed((v) => !v); }}
          className="text-text-muted hover:text-text transition-colors duration-[120ms] shrink-0"
          aria-label={revealed ? 'Hide account number' : 'Show account number'}
        >
          {revealed ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      <div className="mt-auto flex flex-col gap-1">
        <span className="text-xs text-text-muted">
          {account.type === 'credit' ? 'Available credit' : 'Available balance'}
        </span>
        <span
          className={['text-2xl font-medium mono', isDebt ? 'text-negative-text' : ''].filter(Boolean).join(' ')}
        >
          {formatMoney(account.availableBalanceMinor)}
        </span>
      </div>
    </Card>
  );
}

export default function AccountsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: accountsApi.list,
  });

  return (
    <>
      <PageHeader
        topTitle="Your money"
        title="Accounts"
        description="All of your Eagle Bank accounts in one place."
      />

      {isError ? (
        <Card>
          <ErrorState message="We couldn't load your accounts." onRetry={() => void refetch()} />
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col gap-3 min-h-[180px]">
              <Skeleton width="40%" height={16} />
              <Skeleton width="55%" height={20} />
              <Skeleton width="70%" height={32} />
            </Card>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 stagger">
          {data.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No accounts yet"
            description="Once you open an account it will show up here."
          />
        </Card>
      )}
    </>
  );
}
