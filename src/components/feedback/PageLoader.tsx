import { Spinner } from '@/components/ui';

/** Fallback for lazy loaded routes. */
export function PageLoader() {
  return (
    <div className="grid place-items-center min-h-[50vh] text-primary" role="status" aria-live="polite">
      <Spinner size={28} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
