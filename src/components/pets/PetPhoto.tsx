import { cn } from '@/lib/cn';
import type { Species } from '@/lib/types';
import { SpeciesIllustration } from '@/components/illustrations/Pets';

const speciesBg: Record<Species, string> = {
  dog: 'from-beacon-100 to-amber-200 dark:from-beacon-500/20 dark:to-amber-500/10',
  cat: 'from-harbor-100 to-teal-200 dark:from-harbor-500/20 dark:to-teal-500/10',
  other: 'from-stone-100 to-stone-200 dark:from-stone-700/40 dark:to-stone-800/40',
};

/** Renders a pet photo, or an original species illustration when no photo exists. */
export function PetPhoto({
  photoUrl,
  species,
  alt,
  className,
  rounded = 'rounded-3xl',
  illoClassName,
}: {
  photoUrl?: string | null;
  species: Species;
  alt: string;
  className?: string;
  rounded?: string;
  illoClassName?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={alt}
        className={cn('h-full w-full object-cover', rounded, className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br',
        speciesBg[species],
        rounded,
        className,
      )}
      role="img"
      aria-label={alt}
    >
      <SpeciesIllustration species={species} className={cn('h-1/2 w-1/2', illoClassName)} />
    </div>
  );
}
