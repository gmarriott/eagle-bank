import type { ReactNode } from 'react';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Initial view used for - Login and Register. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-2 max-[860px]:grid-cols-1">
      {/* Brand panel — hidden on mobile */}
      <aside
        className="grid place-items-center p-12 text-text-inverse max-[860px]:hidden"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(194, 136, 78, 0.18), transparent 50%), linear-gradient(160deg, var(--color-primary))',
        }}
        aria-hidden
      >
        <div className="max-w-[360px]">
          <span className="font-display text-2xl tracking-[-0.01em]">✦ Eagle Banking</span>
          <p className="mt-6 text-lg leading-snug text-[#d8e2df]">
            Your high flying banking application.
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="grid place-items-center p-8">
        <div className="w-[min(400px,100%)] animate-fade-in-slow">
          <header className="mb-8">
            <span className="hidden max-[860px]:block font-display text-xl text-primary mb-4">
              ✦ Eagle Bank
            </span>
            <h1 className="font-display text-3xl tracking-[-0.02em]">{title}</h1>
            <p className="mt-2 text-text-muted">{subtitle}</p>
          </header>
          {children}
          <p className="mt-8 text-sm text-text-muted text-center [&_a]:text-primary [&_a]:font-semibold [&_a]:hover:underline">
            {footer}
          </p>
        </div>
      </main>
    </div>
  );
}
