'use client';

import { cn } from '@/lib/cn';
import type { ContactPref, Size, Species, SpeciesFilter } from '@/lib/types';
import { PawPrint } from '@/components/illustrations/Pets';

function OptionButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-sm font-semibold transition',
        active
          ? 'border-beacon-400 bg-beacon-50 text-beacon-700 shadow-soft dark:border-beacon-500 dark:bg-beacon-500/15 dark:text-beacon-300'
          : 'border-stone-200 bg-white/70 text-ink-soft hover:border-beacon-200 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-300',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SpeciesPicker({ value, onChange }: { value: Species; onChange: (v: Species) => void }) {
  const opts: { value: Species; label: string; emoji: string }[] = [
    { value: 'dog', label: 'Dog', emoji: '🐕' },
    { value: 'cat', label: 'Cat', emoji: '🐈' },
    { value: 'other', label: 'Other', emoji: '🐾' },
  ];
  return (
    <div className="flex gap-2">
      {opts.map((o) => (
        <OptionButton key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>
          <span className="text-xl" aria-hidden>
            {o.emoji}
          </span>
          {o.label}
        </OptionButton>
      ))}
    </div>
  );
}

export function SizePicker({ value, onChange }: { value: Size; onChange: (v: Size) => void }) {
  const opts: { value: Size; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];
  return (
    <div className="flex gap-2">
      {opts.map((o) => (
        <OptionButton key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </OptionButton>
      ))}
    </div>
  );
}

export function RadiusPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const opts = [1, 3, 5, 10];
  return (
    <div className="flex gap-2">
      {opts.map((km) => (
        <OptionButton key={km} active={value === km} onClick={() => onChange(km)}>
          <PawPrint className={cn('h-4 w-4', value === km ? 'text-beacon-500' : 'text-stone-300')} />
          {km} km
        </OptionButton>
      ))}
    </div>
  );
}

export function SpeciesFilterPicker({
  value,
  onChange,
}: {
  value: SpeciesFilter;
  onChange: (v: SpeciesFilter) => void;
}) {
  const opts: { value: SpeciesFilter; label: string }[] = [
    { value: 'dogs', label: 'Dogs' },
    { value: 'cats', label: 'Cats' },
    { value: 'all', label: 'All pets' },
  ];
  return (
    <div className="flex gap-2">
      {opts.map((o) => (
        <OptionButton key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </OptionButton>
      ))}
    </div>
  );
}

export function ContactPrefPicker({
  value,
  onChange,
}: {
  value: ContactPref;
  onChange: (v: ContactPref) => void;
}) {
  const opts: { value: ContactPref; label: string; hint: string }[] = [
    { value: 'in_app', label: 'Sightings only', hint: 'Neighbours notify you by reporting sightings' },
    { value: 'phone', label: 'Phone', hint: 'Share a number for people to call or text' },
    { value: 'email', label: 'Email', hint: 'Share an email for people to reach you' },
  ];
  return (
    <div className="space-y-2">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
            value === o.value
              ? 'border-beacon-400 bg-beacon-50 dark:border-beacon-500 dark:bg-beacon-500/15'
              : 'border-stone-200 bg-white/70 dark:border-stone-700 dark:bg-stone-900/50',
          )}
        >
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border-2 transition',
              value === o.value ? 'border-beacon-500 bg-beacon-500' : 'border-stone-300',
            )}
          >
            {value === o.value && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink dark:text-cream-50">{o.label}</span>
            <span className="block text-xs text-ink-muted dark:text-stone-400">{o.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
