import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/queryClient';
import { Badge } from '@/components/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import { formatDateTime, formatSignedMoney } from '@/lib/format';
import type { Transaction, TransactionType } from '@/types';

const TYPE_TONE: Record<TransactionType, 'info' | 'neutral' | 'positive'> = {
  deposit: 'positive',
  withdrawal: 'neutral',
  transfer: 'info',
};

type Props = {
  transaction: Transaction;
  colSpan: number;
}

export function TransactionExpandedRow({ transaction, colSpan }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.transaction(transaction.id),
    queryFn: () => transactionsApi.byId(transaction.id),
    initialData: transaction,
  });

  const transactionData = data ?? transaction;

  return (
    <tr className="[&:last-child_td]:border-b-0">
      <td colSpan={colSpan} className="px-4 py-4 border-b border-border bg-surface-sunken">
        {isError ? (
          <ErrorState message="We couldn't load this transaction." onRetry={() => void refetch()} />
        ) : (
          <dl className="m-0 flex flex-col gap-2 max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-1">
              <span
                className={[
                  'text-xl font-semibold mono',
                  transactionData.amountMinor > 0 ? 'text-positive-text' : 'text-text',
                ].join(' ')}
              >
                {formatSignedMoney(transactionData.amountMinor)}
              </span>
              <Badge tone={TYPE_TONE[transactionData.type]}>{transactionData.type}</Badge>
            </div>
            <Row label="Counterparty" value={transactionData.counterparty} />
            <Row label="Date" value={formatDateTime(transactionData.date)} />
            <Row label="Status" value={<span className="capitalize">{transactionData.status}</span>} />
            <Row label="Account" value={<span className="mono">{transactionData.accountId}</span>} />
            <Row label="Reference" value={<span className="mono">{transactionData.id}</span>} />
            {isLoading && (
              <p className="text-xs text-text-muted m-0" role="status">
                Refreshing…
              </p>
            )}
          </dl>
        )}
      </td>
    </tr>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-text-muted m-0">{label}</dt>
      <dd className="m-0 text-right text-text font-medium">{value}</dd>
    </div>
  );
}
