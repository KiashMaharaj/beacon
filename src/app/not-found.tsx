import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PawPrint } from '@/components/illustrations/Pets';
import { NeighbourhoodIllustration } from '@/components/illustrations/Scenery';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <NeighbourhoodIllustration className="max-w-xs" />
      <PawPrint className="mt-4 h-8 w-8 text-beacon-300" />
      <h1 className="mt-4 font-display text-2xl font-extrabold text-ink dark:text-cream-50">
        This trail went cold
      </h1>
      <p className="mt-2 text-sm text-ink-muted dark:text-stone-400">
        We couldn&apos;t find that page. Let&apos;s get you back to safe ground.
      </p>
      <Link href="/home" className="mt-6">
        <Button size="lg">Back to Beacon</Button>
      </Link>
    </div>
  );
}
