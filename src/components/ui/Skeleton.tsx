import type { CSSProperties } from 'react';

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

/** Skeleton loader made resuable with props to handle different states while app loads */
export function Skeleton({ width = '100%', height = 16, radius, className }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: radius };
  return (
    <span
      aria-hidden
      className={['skeleton-shimmer', className].filter(Boolean).join(' ')}
      style={style}
    />
  );
}
