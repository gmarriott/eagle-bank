import type { ReactNode } from 'react';

type PageHeaderProps = {
  topTitle?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ topTitle, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
      <div>
        {topTitle && (
          <p className="text-xs uppercase tracking-[0.1em] text-accent-hover font-semibold mb-2">
            {topTitle}
          </p>
        )}
        <h1 className="font-display text-3xl tracking-[-0.02em]">{title}</h1>
        {description && (
          <p className="mt-2 text-text-muted max-w-[60ch]">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
