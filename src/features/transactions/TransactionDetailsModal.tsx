import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/queryClient';
import { Badge, Modal, Skeleton } from '@/components/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import { formatDateTime, formatSignedMoney } from '@/lib/format';
import type { Transaction, TransactionType } from '@/types';

const TYPE_TONE: Record<TransactionType, 'info' | 'neutral' | 'positive'> = {
  deposit: 'positive',
  withdrawal: 'neutral',
  transfer: 'info',
};

type Props = {
  /** The row the user clicked. Used as instant placeholder data. */
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Shows full transaction details. We deliberately re-fetch the single record
 * through GET /transactions/:id (seeded with the row we already have via
 * `initialData`) so the detail endpoint is genuinely exercised and the modal
 * has its own loading / error states — mirroring how a real app would fetch a
 * canonical, possibly richer, server record on demand.
 */
export function TransactionDetailsModal({ transaction, open, onClose }: Props) {
  const id = transaction?.id;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.transaction(id ?? 'none'),
    queryFn: () => transactionsApi.byId(id as string),
    enabled: open && Boolean(id),
    initialData: transaction ?? undefined,
  });

  const transactionData = data ?? transaction;

  return (
    <Modal open={open} onClose={onClose} title="Transaction details">
      {isError && !transactionData ? (
        <ErrorState message="We couldn't load this transaction." onRetry={() => void refetch()} />
      ) : !transactionData ? (
        <div className="flex flex-col gap-3 m-0" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={20} />
          ))}
        </div>
      ) : (
        <dl className="flex flex-col gap-3 m-0">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span
              className={['text-2xl font-medium mono', transactionData.amountMinor > 0 ? 'text-positive-text' : 'text-text'].join(' ')}
            >
              {formatSignedMoney(transactionData.amountMinor)}
            </span>
            <Badge tone={TYPE_TONE[transactionData.type]}>{transactionData.type}</Badge>
          </div>

          <Row label="Description" value={transactionData.description} />
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
    </Modal>
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
