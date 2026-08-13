import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { PetReport } from '@/lib/types';
import { formatDistance } from '@/lib/geo';
import { speciesLabel, timeMissing } from '@/lib/format';
import { PetPhoto } from './PetPhoto';
import { StatusBadge } from './StatusBadge';
import { ShareButton } from './ShareButton';
import { ClockIcon, MapPinIcon } from '@/components/ui/icons';

export function PetCard({ report, className }: { report: PetReport; className?: string }) {
  const title = report.name ?? (report.kind === 'found' ? `Found ${speciesLabel(report.species).toLowerCase()}` : 'Unnamed pet');
  return (
    <div className={cn('relative h-full', className)}>
      <Link
        href={`/pets/${report.id}`}
        className={cn(
          'group flex h-full w-full flex-col overflow-hidden rounded-4xl border border-white/60 bg-white/80 shadow-card backdrop-blur-sm transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beacon-400',
          'dark:border-stone-800 dark:bg-stone-900/70',
        )}
      >
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
          <PetPhoto
            photoUrl={report.photoUrl}
            species={report.species}
            alt={title}
            rounded="rounded-none"
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2.5 top-2.5">
            <StatusBadge report={report} overlay />
          </div>
          {report.distanceKm != null && (
            <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <MapPinIcon className="h-3 w-3" />
              {formatDistance(report.distanceKm)}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-display text-lg font-bold text-ink dark:text-cream-50">
              {title}
            </h3>
            <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-ink-muted dark:bg-stone-800 dark:text-stone-400">
              {speciesLabel(report.species)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm text-ink-muted dark:text-stone-400">
            {[report.breed, report.colour].filter(Boolean).join(' · ') || 'Details inside'}
          </p>

          <div className="mt-auto flex min-h-[1.25rem] items-center gap-3 pt-3 text-xs text-ink-muted dark:text-stone-500">
            {report.location?.label && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{report.location.label}</span>
              </span>
            )}
            {report.status !== 'reunited' && report.lastSeenAt && (
              <span className="inline-flex shrink-0 items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {timeMissing(report.lastSeenAt)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Overlay share control (sibling of the link so it isn't nested interactive) */}
      <ShareButton report={report} className="absolute right-2.5 top-2.5 z-10" />
    </div>
  );
}
