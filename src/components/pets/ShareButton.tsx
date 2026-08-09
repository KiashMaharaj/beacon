'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { PetReport } from '@/lib/types';
import { shareReport } from '@/lib/share';
import { ShareIcon, CheckIcon } from '@/components/ui/icons';

/** Compact share button, safe to overlay on a card without triggering its link. */
export function ShareButton({ report, className }: { report: PetReport; className?: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await shareReport(report);
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Share ${report.name ?? 'this pet'}`}
      title="Share"
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
        className,
      )}
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
    </button>
  );
}
