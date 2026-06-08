import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-12 px-6 text-text-muted">
      {icon && (
        <div
          className="w-14 h-14 grid place-items-center rounded-pill bg-surface-sunken text-primary"
          aria-hidden
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg text-text">{title}</h3>
      {description && <p className="max-w-[38ch] text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
