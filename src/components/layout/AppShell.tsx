'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { LogoMark } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { BottomNav } from './BottomNav';

/**
 * Mobile-first phone-frame shell used by all in-app screens.
 */
export function AppShell({
  children,
  title,
  back,
  showNav = true,
  action,
  className,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  showNav?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-lg">
        {back ? (
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-ink-soft shadow-soft transition hover:scale-105 dark:border-stone-700 dark:bg-stone-800/70 dark:text-cream-50"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        ) : (
          <Link href="/" aria-label="Beacon landing page" className="inline-flex">
            <LogoMark className="h-9 w-9" />
          </Link>
        )}

        {title ? (
          <h1 className="flex-1 truncate font-display text-lg font-bold text-ink dark:text-cream-50">
            {title}
          </h1>
        ) : (
          <span className="flex-1 font-display text-lg font-extrabold tracking-tight text-ink dark:text-cream-50">
            Beacon
          </span>
        )}

        {action}
        <ThemeToggle />
      </header>

      <main className={cn('flex-1 px-4 pb-28', showNav && 'pb-32', className)}>{children}</main>

      {showNav && <BottomNav />}
    </div>
  );
}
