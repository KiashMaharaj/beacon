'use client';

import { cn } from '@/lib/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex w-full items-center gap-1 rounded-2xl bg-stone-100/80 p-1 dark:bg-stone-800/70',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl font-semibold transition-all',
              size === 'sm' ? 'h-8 px-2 text-xs' : 'h-10 px-3 text-sm',
              active
                ? 'bg-white text-beacon-700 shadow-soft dark:bg-stone-900 dark:text-beacon-300'
                : 'text-ink-muted hover:text-ink-soft dark:text-stone-400 dark:hover:text-stone-200',
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
