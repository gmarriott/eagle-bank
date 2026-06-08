import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-md border border-transparent whitespace-nowrap transition-[background-color,transform,box-shadow] duration-[120ms] ease-[var(--ease-out)] disabled:opacity-55 disabled:cursor-not-allowed [&:active:not(:disabled)]:translate-y-px';

const SIZE: Record<Size, string> = {
  sm: 'text-sm py-2 px-3',
  md: 'text-sm py-3 px-6',
  lg: 'text-base py-4 px-8',
};

const VARIANT: Record<Variant, string> = {
  primary:   'bg-primary text-on-primary shadow-sm hover:bg-primary-hover',
  secondary: 'bg-surface text-text border-border-strong hover:bg-surface-sunken',
  ghost:     'bg-transparent text-text hover:bg-surface-sunken',
  danger:    'bg-negative text-white hover:bg-negative-text',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, fullWidth, children, disabled, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[BASE, SIZE[size], VARIANT[variant], fullWidth ? 'w-full' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={16} aria-hidden />}
      <span className={loading ? 'opacity-70' : undefined}>{children}</span>
    </button>
  );
});
