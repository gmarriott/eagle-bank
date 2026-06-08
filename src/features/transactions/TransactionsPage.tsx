import { Fragment, useMemo, useState, type ChangeEvent } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/queryClient';
import { Badge, Button, Card, EmptyState, Skeleton, TextField } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TransactionExpandedRow } from './TransactionExpandedRow';
import { formatDate, formatSignedMoney } from '@/lib/format';
import type { TransactionQuery, TransactionType } from '@/types';

const PAGE_SIZE = 8;

const TYPE_TONE: Record<TransactionType, 'info' | 'neutral' | 'positive'> = {
  deposit: 'positive',
  withdrawal: 'neutral',
  transfer: 'info',
};

type SortKey = 'date' | 'amount';

const TH = 'text-xs uppercase tracking-[0.06em] text-text-muted font-semibold bg-surface-sunken px-4 py-3 text-left border-b border-border whitespace-nowrap';
const TD = 'px-4 py-3 text-left border-b border-border whitespace-nowrap text-sm';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleRow(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const query: TransactionQuery = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, sortBy, sortDir, from: from || undefined, to: to || undefined }),
    [page, sortBy, sortDir, from, to],
  );

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: queryKeys.transactions(query),
    queryFn: () => transactionsApi.list(query),
    placeholderData: keepPreviousData,
  });

  function clearFilters() {
    setFrom('');
    setTo('');
    setPage(1);
  }

  function handleSortByChange(event: ChangeEvent<HTMLSelectElement>) {
    setSortBy(event.target.value as SortKey);
    setPage(1);
  }

  function toggleSortDirection() {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  }

  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' =>
    sortBy !== key ? 'none' : sortDir === 'asc' ? 'ascending' : 'descending';

  return (
    <>
      <PageHeader
        topTitle="History"
        title="Transactions"
        description="Search, sort and review every payment across your accounts."
      />

      {/* Filters */}
      <Card className="mb-4" as="section" aria-label="Filter transactions">
        <div className="flex flex-wrap items-end gap-4">
          <TextField
            label="From"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          />
          <TextField
            label="To"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
          />
          <div className="min-w-[220px]">
            <label htmlFor="sortBy" className="text-sm font-semibold text-text block mb-2">
              Sort by
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id="sortBy"
                value={sortBy}
                onChange={handleSortByChange}
                className="flex-1 rounded-md border border-border bg-surface px-3 py-3 text-sm outline-none transition-colors duration-[120ms] focus:border-focus-ring focus:ring-2 focus:ring-focus-ring"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <Button variant="secondary" size="sm" onClick={toggleSortDirection}>
                {sortDir === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>
          <div className="ml-auto max-[560px]:ml-0">
            <Button variant="ghost" onClick={clearFilters} disabled={!from && !to}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Table card — strip padding so the table sits flush */}
      <Card className="!p-0 overflow-hidden">
        {isError ? (
          <ErrorState message="We couldn't load transactions." onRetry={() => void refetch()} />
        ) : (
          <>
            <span className="sr-only" role="status" aria-live="polite">
              {isFetching ? 'Updating transactions' : ''}
            </span>

            <div
              className="overflow-x-auto transition-opacity duration-[120ms]"
              data-fetching={isFetching || undefined}
              style={{ opacity: isFetching ? 0.55 : undefined }}
            >
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">List of your transactions</caption>
                <thead>
                  <tr>
                    <th scope="col" className={TH}>Description</th>
                    <th scope="col" className={TH}>Type</th>
                    <th scope="col" className={TH} aria-sort={ariaSort('date')}>
                      Date {sortBy === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th scope="col" className={`${TH} text-right`} aria-sort={ariaSort('amount')}>
                      Amount {sortBy === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th scope="col" className={`${TH} w-10`}><span className="sr-only">Expand</span></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <tr key={i}>
                          <td className={TD}><Skeleton width="60%" /></td>
                          <td className={TD}><Skeleton width={70} /></td>
                          <td className={TD}><Skeleton width={90} /></td>
                          <td className={`${TD} text-right`}><Skeleton width={80} /></td>
                          <td className={TD} />
                        </tr>
                      ))
                    : data?.items.map((transaction) => (
                        <Fragment key={transaction.id}>
                          <tr
                            className={`cursor-pointer transition-[background] duration-[120ms] hover:bg-surface-sunken focus-visible:[outline-offset:-2px] [&:last-child_td]:border-b-0 ${expandedId === transaction.id ? 'bg-surface-sunken' : ''}`}
                            onClick={() => toggleRow(transaction.id)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleRow(transaction.id);
                              }
                            }}
                            aria-expanded={expandedId === transaction.id}
                            aria-label={`${expandedId === transaction.id ? 'Collapse' : 'Expand'} details for ${transaction.description}`}
                          >
                            <td className={TD}>
                              <span className="block font-medium text-text">{transaction.description}</span>
                              <span className="block text-xs text-text-muted">{transaction.counterparty}</span>
                            </td>
                            <td className={TD}><Badge tone={TYPE_TONE[transaction.type]}>{transaction.type}</Badge></td>
                            <td className={`${TD} tabular`}>{formatDate(transaction.date)}</td>
                            <td
                              className={`${TD} text-right mono`}
                              style={{ color: transaction.amountMinor > 0 ? 'var(--color-positive-text)' : 'var(--color-text)' }}
                            >
                              {formatSignedMoney(transaction.amountMinor)}
                            </td>
                            <td className={`${TD} w-10 text-center text-text-muted`}>
                              <svg
                                width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
                                className="inline-block transition-transform duration-150"
                                style={{ transform: expandedId === transaction.id ? 'rotate(90deg)' : 'rotate(0deg)' }}
                              >
                                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </td>
                          </tr>
                          {expandedId === transaction.id && (
                            <TransactionExpandedRow transaction={transaction} colSpan={5} />
                          )}
                        </Fragment>
                      ))}
                </tbody>
              </table>
            </div>

            {!isLoading && data && data.items.length === 0 && (
              <EmptyState
                title="No transactions found"
                description="Try widening your date range or clearing filters."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            )}

            {data && data.total > 0 && (
              <nav
                className="flex items-center justify-between gap-4 p-4 border-t border-border flex-wrap"
                aria-label="Transactions pagination"
              >
                <span className="text-sm text-text-muted">
                  Page {data.page} of {data.totalPages} · {data.total} transactions
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={data.page <= 1}
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={data.page >= data.totalPages}
                  >
                    Next →
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}
      </Card>

    </>
  );
}
