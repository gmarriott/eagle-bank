import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'article';
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ as: Tag = 'div', interactive, className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={[
        'bg-surface border border-border rounded-lg p-6 shadow-sm',
        interactive
          ? 'transition-[box-shadow,transform,border-color] duration-[220ms] ease-[var(--ease-out)] hover:shadow-md hover:-translate-y-[2px] hover:border-border-strong'
          : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
