import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  leading?: ReactNode;
}

/**
 * Accessible text input: every field has a real <label>, errors are linked via
 * aria-describedby and announced with role="alert", and invalid state is
 * exposed with aria-invalid (not just colour, which fails for low-vision users).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, hideLabel, leading, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
      <label
        htmlFor={inputId}
        className={hideLabel ? 'sr-only' : 'text-sm font-semibold text-text'}
      >
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-text-muted -mt-1">
          {hint}
        </p>
      )}
      <div
        className={[
          'flex items-center gap-2 bg-surface border rounded-md px-3 transition-[border-color,box-shadow] duration-[120ms] ease-[var(--ease-out)]',
          'focus-within:border-focus-ring focus-within:shadow-[var(--shadow-focus)]',
          error
            ? 'border-negative focus-within:shadow-[var(--shadow-focus-error)]'
            : 'border-border-strong',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {leading && (
          <span className="text-text-subtle inline-flex" aria-hidden>
            {leading}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className="flex-1 border-0 outline-none bg-transparent py-3 text-base placeholder:text-text-subtle"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-negative-text font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
