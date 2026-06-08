import { Button, EmptyState } from '@/components/ui';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Inline, error presented if data retrieval fails. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn’t load this. Please try again later.',
  onRetry,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={<span style={{ fontSize: 24 }} aria-hidden>⚠️</span>}
      title={title}
      description={message}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}
