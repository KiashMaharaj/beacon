import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'beacon' | 'harbor' | 'success' | 'neutral' | 'warning';

const tones: Record<Tone, string> = {
  beacon: 'bg-beacon-100 text-beacon-700 dark:bg-beacon-500/15 dark:text-beacon-300',
  harbor: 'bg-harbor-100 text-harbor-700 dark:bg-harbor-500/15 dark:text-harbor-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  neutral: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
