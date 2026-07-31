'use client';

import { useMemo, useState } from 'react';
import { useBeacon } from '@/lib/store';
import { useViewerLocation } from '@/lib/useViewerLocation';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { PetCard } from '@/components/pets/PetCard';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/Feedback';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Input } from '@/components/ui/Field';
import { SearchIcon } from '@/components/ui/icons';
import { OtherPetIllustration } from '@/components/illustrations/Pets';
import type { PetReport, Species } from '@/lib/types';

type SpeciesTab = 'all' | Species;
type SortKey = 'nearest' | 'recent' | 'longest';
type StatusTab = 'active' | 'found' | 'reunited';

const speciesTabs: { value: SpeciesTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dog', label: 'Dogs' },
  { value: 'cat', label: 'Cats' },
  { value: 'other', label: 'Other' },
];

const statusTabs: { value: StatusTab; label: string }[] = [
  { value: 'active', label: 'Missing' },
  { value: 'found', label: 'Found' },
  { value: 'reunited', label: 'Reunited' },
];

const sortTabs: { value: SortKey; label: string }[] = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'recent', label: 'Recently added' },
  { value: 'longest', label: 'Missing longest' },
];

function matchesQuery(r: PetReport, q: string): boolean {
  if (!q) return true;
  const hay = [r.name, r.breed, r.colour, r.description, r.location?.label, r.species]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

function NearbyContent() {
  const { reports, withDistance } = useBeacon();
  useViewerLocation();

  const [species, setSpecies] = useState<SpeciesTab>('all');
  const [status, setStatus] = useState<StatusTab>('active');
  const [sort, setSort] = useState<SortKey>('nearest');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    let items = withDistance(reports);

    items = items.filter((r) => {
      if (status === 'active') return r.status === 'active' && r.kind === 'missing';
      if (status === 'found') return r.status === 'active' && r.kind === 'found';
      return r.status === 'reunited';
    });

    if (species !== 'all') items = items.filter((r) => r.species === species);
    items = items.filter((r) => matchesQuery(r, query));

    items.sort((a, b) => {
      if (sort === 'nearest') return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      if (sort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // longest missing
      return new Date(a.lastSeenAt ?? 0).getTime() - new Date(b.lastSeenAt ?? 0).getTime();
    });

    return items;
  }, [reports, withDistance, species, status, sort, query]);

  return (
    <AppShell title="Nearby">
      <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-cream-50/80 px-4 pb-3 pt-1 backdrop-blur dark:bg-stone-950/80">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, breed, colour…"
            className="pl-11"
            aria-label="Search pets"
          />
        </div>
        <SegmentedControl options={statusTabs} value={status} onChange={setStatus} size="sm" />
        <SegmentedControl options={speciesTabs} value={species} onChange={setSpecies} size="sm" />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 hide-scrollbar">
          {sortTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setSort(t.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                sort === t.value
                  ? 'bg-beacon-500 text-white shadow-soft'
                  : 'bg-stone-100 text-ink-muted dark:bg-stone-800 dark:text-stone-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-muted dark:text-stone-400">
        {list.length} {list.length === 1 ? 'result' : 'results'}
      </p>

      {list.length === 0 ? (
        <Card className="mt-3">
          <EmptyState
            illustration={<OtherPetIllustration className="h-32 w-32" />}
            title="Nothing here yet"
            description="Try a different filter or search term. Fewer results is often good news."
          />
        </Card>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {list.map((r) => (
            <PetCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default function NearbyPage() {
  return (
    <Guard>
      <NearbyContent />
    </Guard>
  );
}
