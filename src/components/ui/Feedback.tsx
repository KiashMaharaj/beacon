import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Loading skeleton block with shimmer. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-stone-200/70 dark:bg-stone-800/70',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer',
        'after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent dark:after:via-white/5',
        className,
      )}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-beacon-200 border-t-beacon-500',
        className,
      )}
    />
  );
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: {
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {illustration && <div className="mb-5 animate-float">{illustration}</div>}
      <h3 className="font-display text-lg font-bold text-ink dark:text-cream-50">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted dark:text-stone-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
