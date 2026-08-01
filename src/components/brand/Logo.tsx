import { cn } from '@/lib/cn';

/**
 * Beacon logo - an original mark combining a beacon/lighthouse beam,
 * a location pin silhouette, and a paw print at its heart.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('h-10 w-10', className)}
      role="img"
      aria-label="Beacon logo"
      fill="none"
    >
      <defs>
        <linearGradient id="beacon-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="55%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="beacon-beam-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Guiding beams */}
      <path d="M32 6 L20 22 H44 Z" fill="url(#beacon-beam-grad)" />

      {/* Location pin body */}
      <path
        d="M32 10c-10.5 0-19 8.2-19 18.6 0 12.9 15.9 26 18.1 27.8a1.4 1.4 0 0 0 1.8 0C35.1 54.6 51 41.5 51 28.6 51 18.2 42.5 10 32 10Z"
        fill="url(#beacon-mark-grad)"
      />
      {/* Inner light disc */}
      <circle cx="32" cy="28" r="12.5" fill="#fff7ed" />

      {/* Paw print at the heart */}
      <g fill="#ea580c">
        <ellipse cx="32" cy="31.5" rx="5" ry="4.2" />
        <ellipse cx="25.5" cy="26.5" rx="2.5" ry="3.1" />
        <ellipse cx="32" cy="23.5" rx="2.6" ry="3.2" />
        <ellipse cx="38.5" cy="26.5" rx="2.5" ry="3.1" />
      </g>
    </svg>
  );
}

export function Wordmark({ className, showTagline = false }: { className?: string; showTagline?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9" />
      <div className="leading-none">
        <span className="font-display text-xl font-extrabold tracking-tight text-ink dark:text-cream-50">
          Beacon
        </span>
        {showTagline && (
          <span className="mt-0.5 block text-[11px] font-medium text-ink-muted dark:text-stone-400">
            Helping neighbours bring pets home.
          </span>
        )}
      </div>
    </div>
  );
}
