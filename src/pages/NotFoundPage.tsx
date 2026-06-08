import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function NotFoundPage() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center text-center gap-3 p-8"
      id="main-content"
    >
      <p className="font-display text-[clamp(4rem,14vw,7rem)] leading-none text-accent m-0">
        404
      </p>
      <h1 className="font-display text-2xl m-0 text-text">Page not found</h1>
      <Link to="/dashboard" className="mt-3 no-underline">
        <Button>Back to dashboard</Button>
      </Link>
    </main>
  );
}
