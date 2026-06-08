import type { ReactNode } from 'react';

type Tone = 'neutral' | 'positive' | 'negative' | 'warning' | 'info';

const TONE: Record<Tone, string> = {
  neutral:  'bg-surface-sunken text-text-muted',
  positive: 'bg-positive-bg text-positive-text',
  negative: 'bg-negative-bg text-negative-text',
  warning:  'bg-warning-bg text-warning-text',
  info:     'bg-info-bg text-info-text',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 text-xs font-semibold tracking-[0.02em] capitalize py-[3px] px-2 rounded-pill border border-transparent',
        TONE[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}
