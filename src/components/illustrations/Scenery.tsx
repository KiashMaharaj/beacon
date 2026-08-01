import { cn } from '@/lib/cn';

interface IlloProps {
  className?: string;
}

/** A cosy row of neighbourhood houses with a tree - used on onboarding & empty states. */
export function NeighbourhoodIllustration({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 360 240" className={cn('w-full', className)} fill="none" role="img" aria-label="Neighbourhood">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#ffedd5" />
        </linearGradient>
        <linearGradient id="house-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="house-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <rect width="360" height="240" rx="24" fill="url(#sky)" />
      {/* sun */}
      <circle cx="300" cy="56" r="26" fill="#fcd34d" opacity="0.8" />
      {/* rolling hill */}
      <path d="M0 200c60-28 120-28 180 0s120 28 180 0v40H0Z" fill="#bbf7d0" opacity="0.7" />
      <path d="M0 214c70-20 130-20 200 0s110 18 160 4v22H0Z" fill="#86efac" opacity="0.6" />

      {/* tree */}
      <g>
        <rect x="52" y="150" width="10" height="40" rx="4" fill="#92400e" />
        <circle cx="57" cy="140" r="26" fill="#4ade80" />
        <circle cx="40" cy="150" r="18" fill="#22c55e" />
        <circle cx="74" cy="150" r="18" fill="#22c55e" />
      </g>

      {/* house A */}
      <g>
        <rect x="110" y="150" width="70" height="56" rx="6" fill="url(#house-a)" />
        <path d="M104 152 145 118l41 34Z" fill="#c2410c" />
        <rect x="122" y="168" width="18" height="18" rx="3" fill="#fff7ed" />
        <rect x="150" y="168" width="20" height="38" rx="3" fill="#7c2d12" />
      </g>

      {/* house B */}
      <g>
        <rect x="196" y="158" width="64" height="48" rx="6" fill="url(#house-b)" />
        <path d="M190 160 228 130l38 30Z" fill="#0f766e" />
        <rect x="206" y="174" width="16" height="16" rx="3" fill="#f0fdfa" />
        <rect x="232" y="174" width="18" height="32" rx="3" fill="#134e4a" />
      </g>

      {/* little paw trail */}
      <g fill="#f97316" opacity="0.5">
        <circle cx="150" cy="222" r="3" />
        <circle cx="168" cy="216" r="3" />
        <circle cx="186" cy="222" r="3" />
        <circle cx="204" cy="216" r="3" />
      </g>
    </svg>
  );
}

/** A stylised map card backdrop with a location pin. */
export function MapIllustration({ className, pinLabel }: IlloProps & { pinLabel?: string }) {
  return (
    <svg viewBox="0 0 360 200" className={cn('w-full', className)} fill="none" role="img" aria-label={pinLabel ? `Map: ${pinLabel}` : 'Map'}>
      <defs>
        <linearGradient id="map-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>
      </defs>
      <rect width="360" height="200" rx="20" fill="url(#map-bg)" />
      {/* water */}
      <path d="M0 120c60 20 100-10 160 6s120 30 200 8v66H0Z" fill="#a7f3d0" opacity="0.6" />
      {/* roads */}
      <g stroke="#fff" strokeWidth="8" opacity="0.9" strokeLinecap="round">
        <path d="M40 20 120 200" />
        <path d="M0 96 360 70" />
        <path d="M250 0 300 200" />
      </g>
      <g stroke="#fcd34d" strokeWidth="3" opacity="0.8" strokeLinecap="round">
        <path d="M40 20 120 200" />
        <path d="M0 96 360 70" />
      </g>
      {/* parks */}
      <circle cx="80" cy="120" r="20" fill="#86efac" opacity="0.7" />
      <rect x="270" y="120" width="46" height="40" rx="8" fill="#86efac" opacity="0.7" />
      {/* pin */}
      <g transform="translate(168 58)">
        <ellipse cx="12" cy="66" rx="12" ry="4" fill="#000" opacity="0.15" />
        <path d="M12 0C5 0 0 5.4 0 12.4 0 21 12 34 12 34s12-13 12-21.6C24 5.4 19 0 12 0Z" fill="#f97316" />
        <circle cx="12" cy="12" r="5" fill="#fff7ed" />
      </g>
      {/* radius ring */}
      <circle cx="180" cy="82" r="46" fill="#f97316" opacity="0.08" />
      <circle cx="180" cy="82" r="46" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.5" />
    </svg>
  );
}

/** Decorative floating paws / hearts for celebration screens. */
export function CelebrationBurst({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 240 240" className={cn('h-56 w-56', className)} fill="none" role="img" aria-label="Reunion celebration">
      <defs>
        <radialGradient id="burst" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fff7ed" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#burst)" />
      {/* rays */}
      <g stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" opacity="0.8">
        <path d="M120 18v22" />
        <path d="M120 200v22" />
        <path d="M18 120h22" />
        <path d="M200 120h22" />
        <path d="M48 48l16 16" />
        <path d="M176 176l16 16" />
        <path d="M192 48l-16 16" />
        <path d="M64 176l-16 16" />
      </g>
      {/* heart */}
      <path
        d="M120 168s-46-28-46-62a26 26 0 0 1 46-17 26 26 0 0 1 46 17c0 34-46 62-46 62Z"
        fill="#fb7185"
      />
      <circle cx="106" cy="112" r="4" fill="#fff" opacity="0.7" />
    </svg>
  );
}
