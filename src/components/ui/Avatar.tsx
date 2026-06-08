import { initialsOf } from '@/lib/format';

export function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  return (
    <span
      className="inline-grid place-items-center rounded-pill overflow-hidden shrink-0 select-none font-semibold text-on-primary"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: 'var(--color-primary)',
      }}
      aria-hidden
    >
      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : initialsOf(name)}
    </span>
  );
}
