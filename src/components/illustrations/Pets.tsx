import { cn } from '@/lib/cn';
import type { Species } from '@/lib/types';

interface IlloProps {
  className?: string;
}

/** A single paw print - used as a decorative motif throughout. */
export function PawPrint({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-6 w-6', className)} fill="currentColor" aria-hidden>
      <ellipse cx="16" cy="20" rx="7" ry="6" />
      <ellipse cx="7.5" cy="12.5" rx="3" ry="4" />
      <ellipse cx="14" cy="8" rx="3.1" ry="4.2" />
      <ellipse cx="21.5" cy="8" rx="3.1" ry="4.2" />
      <ellipse cx="26" cy="14.5" rx="3" ry="4" />
    </svg>
  );
}

/** Happy sitting dog - warm and elegant, not childish. */
export function DogIllustration({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn('h-40 w-40', className)} fill="none" role="img" aria-label="Happy dog">
      <defs>
        <linearGradient id="dog-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="dog-ear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="182" rx="52" ry="9" fill="#000" opacity="0.06" />
      {/* Body */}
      <path d="M62 150c0-30 16-52 38-52s38 22 38 52c0 14-10 22-24 22H86c-14 0-24-8-24-22Z" fill="url(#dog-body)" />
      {/* Front legs */}
      <rect x="82" y="150" width="14" height="30" rx="7" fill="url(#dog-body)" />
      <rect x="104" y="150" width="14" height="30" rx="7" fill="url(#dog-body)" />
      <ellipse cx="89" cy="180" rx="8" ry="5" fill="#fcd34d" />
      <ellipse cx="111" cy="180" rx="8" ry="5" fill="#fcd34d" />
      {/* Head */}
      <circle cx="100" cy="86" r="46" fill="url(#dog-body)" />
      {/* Ears */}
      <path d="M58 66c-10 4-14 26-6 44 8-4 16-16 18-30Z" fill="url(#dog-ear)" />
      <path d="M142 66c10 4 14 26 6 44-8-4-16-16-18-30Z" fill="url(#dog-ear)" />
      {/* Muzzle */}
      <ellipse cx="100" cy="104" rx="26" ry="21" fill="#fef3c7" />
      {/* Eyes */}
      <circle cx="85" cy="80" r="6" fill="#3f2d1a" />
      <circle cx="115" cy="80" r="6" fill="#3f2d1a" />
      <circle cx="87" cy="78" r="2" fill="#fff" />
      <circle cx="117" cy="78" r="2" fill="#fff" />
      {/* Nose + smile */}
      <ellipse cx="100" cy="98" rx="8" ry="6" fill="#3f2d1a" />
      <path d="M100 104c0 8-8 12-14 8" stroke="#3f2d1a" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 104c0 8 8 12 14 8" stroke="#3f2d1a" strokeWidth="3" strokeLinecap="round" />
      {/* Tongue */}
      <path d="M96 112h8v8a4 4 0 0 1-8 0Z" fill="#fb7185" />
      {/* Cheek blush */}
      <circle cx="72" cy="98" r="5" fill="#fb923c" opacity="0.4" />
      <circle cx="128" cy="98" r="5" fill="#fb923c" opacity="0.4" />
    </svg>
  );
}

/** Curious sitting cat. */
export function CatIllustration({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn('h-40 w-40', className)} fill="none" role="img" aria-label="Curious cat">
      <defs>
        <linearGradient id="cat-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="cat-ear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="184" rx="46" ry="8" fill="#000" opacity="0.06" />
      {/* Tail */}
      <path d="M150 150c22 2 30-16 24-30-4 12-16 12-22 6Z" fill="url(#cat-body)" />
      {/* Body */}
      <path d="M66 156c0-26 15-44 34-44s34 18 34 44c0 12-8 20-20 20H86c-12 0-20-8-20-20Z" fill="url(#cat-body)" />
      {/* Head */}
      <circle cx="100" cy="94" r="42" fill="url(#cat-body)" />
      {/* Ears */}
      <path d="M64 70 58 40l30 18Z" fill="url(#cat-ear)" />
      <path d="M136 70 142 40l-30 18Z" fill="url(#cat-ear)" />
      <path d="M67 66 64 50l14 9Z" fill="#5eead4" />
      <path d="M133 66 136 50l-14 9Z" fill="#5eead4" />
      {/* Eyes */}
      <ellipse cx="85" cy="90" rx="6.5" ry="9" fill="#134e4a" />
      <ellipse cx="115" cy="90" rx="6.5" ry="9" fill="#134e4a" />
      <circle cx="87" cy="86" r="2.4" fill="#fff" />
      <circle cx="117" cy="86" r="2.4" fill="#fff" />
      {/* Nose + mouth */}
      <path d="M96 104h8l-4 5Z" fill="#fb7185" />
      <path d="M100 109c0 5-6 7-9 4M100 109c0 5 6 7 9 4" stroke="#0f766e" strokeWidth="2.4" strokeLinecap="round" />
      {/* Whiskers */}
      <g stroke="#0f766e" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <path d="M78 100 58 96" />
        <path d="M78 106 60 108" />
        <path d="M122 100 142 96" />
        <path d="M122 106 140 108" />
      </g>
      {/* Blush */}
      <circle cx="74" cy="104" r="5" fill="#2dd4bf" opacity="0.5" />
      <circle cx="126" cy="104" r="5" fill="#2dd4bf" opacity="0.5" />
    </svg>
  );
}

/** Small friendly rabbit - represents "other" pets. */
export function OtherPetIllustration({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn('h-40 w-40', className)} fill="none" role="img" aria-label="Small pet">
      <defs>
        <linearGradient id="rab-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e7e5e4" />
          <stop offset="100%" stopColor="#a8a29e" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="184" rx="42" ry="8" fill="#000" opacity="0.06" />
      {/* Ears */}
      <path d="M84 90C78 54 74 34 82 30s16 14 18 52Z" fill="url(#rab-body)" />
      <path d="M116 90c6-36 10-56 2-60s-16 14-18 52Z" fill="url(#rab-body)" />
      <path d="M86 84c-4-24-6-40-2-44M114 84c4-24 6-40 2-44" stroke="#f5b8c4" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      {/* Head + body */}
      <circle cx="100" cy="112" r="40" fill="url(#rab-body)" />
      <ellipse cx="100" cy="158" rx="34" ry="24" fill="url(#rab-body)" />
      {/* Eyes */}
      <circle cx="86" cy="108" r="5" fill="#44403c" />
      <circle cx="114" cy="108" r="5" fill="#44403c" />
      <circle cx="87.5" cy="106" r="1.7" fill="#fff" />
      <circle cx="115.5" cy="106" r="1.7" fill="#fff" />
      {/* Nose */}
      <path d="M96 120h8l-4 5Z" fill="#fb7185" />
      <path d="M100 125c0 4-4 6-7 4M100 125c0 4 4 6 7 4" stroke="#78716c" strokeWidth="2.2" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="78" cy="120" r="5" fill="#fb7185" opacity="0.35" />
      <circle cx="122" cy="120" r="5" fill="#fb7185" opacity="0.35" />
    </svg>
  );
}

/** Pick the right species illustration. */
export function SpeciesIllustration({ species, className }: { species: Species; className?: string }) {
  if (species === 'dog') return <DogIllustration className={className} />;
  if (species === 'cat') return <CatIllustration className={className} />;
  return <OtherPetIllustration className={className} />;
}
