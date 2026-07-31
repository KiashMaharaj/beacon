import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-4xl border border-white/60 bg-white/80 shadow-card backdrop-blur-sm',
        'dark:border-stone-800 dark:bg-stone-900/70',
        className,
      )}
      {...props}
    />
  );
});
