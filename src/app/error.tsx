'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PawPrint } from '@/components/illustrations/Pets';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production this would report to an error service (e.g. Sentry).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <PawPrint className="h-14 w-14 text-beacon-300 animate-paw-bounce" />
      <h1 className="mt-5 font-display text-2xl font-extrabold text-ink dark:text-cream-50">
        Something went sideways
      </h1>
      <p className="mt-2 text-sm text-ink-muted dark:text-stone-400">
        A little hiccup on our end. Give it another try.
      </p>
      <Button size="lg" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
