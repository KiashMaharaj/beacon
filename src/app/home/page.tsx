'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useBeacon } from '@/lib/store';
import { useViewerLocation } from '@/lib/useViewerLocation';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { PetCard } from '@/components/pets/PetCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { PawPrint } from '@/components/illustrations/Pets';
import { CelebrationBurst, NeighbourhoodIllustration } from '@/components/illustrations/Scenery';
import { BellIcon, ChevronRightIcon, PlusIcon, SparkleIcon, EyeIcon } from '@/components/ui/icons';

const tips = [
  {
    title: 'Check quiet hiding spots',
    body: 'Frightened cats often stay within a few houses, so check sheds, bushes and under cars at dusk.',
  },
  {
    title: 'Share the beacon',
    body: 'The more neighbours who see a missing pet, the faster they come home. Tap share on any pet.',
  },
  {
    title: 'Leave familiar scents',
    body: 'Place their bed or a worn t-shirt outside. Familiar smells help pets find their way back.',
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function HomeContent() {
  const { reports, withDistance, user, prefs } = useBeacon();
  useViewerLocation();

  const nearby = useMemo(() => {
    const active = reports.filter((r) => r.status === 'active');
    const withDist = withDistance(active);
    return withDist
      .sort((a, b) => {
        const da = a.distanceKm ?? Infinity;
        const db = b.distanceKm ?? Infinity;
        if (da !== db) return da - db;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 6);
  }, [reports, withDistance]);

  const reunited = useMemo(
    () =>
      reports
        .filter((r) => r.status === 'reunited')
        .sort((a, b) => new Date(b.reunitedAt ?? 0).getTime() - new Date(a.reunitedAt ?? 0).getTime())
        .slice(0, 5),
    [reports],
  );

  const activeMissing = reports.filter((r) => r.status === 'active' && r.kind === 'missing').length;

  return (
    <AppShell>
      {/* Greeting */}
      <section className="animate-fade-up">
        <p className="text-sm font-semibold text-beacon-600 dark:text-beacon-400">{greeting()},</p>
        <h1 className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">
          {user.name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-muted dark:text-stone-400">
          {activeMissing > 0
            ? `${activeMissing} pet${activeMissing > 1 ? 's are' : ' is'} missing near you. Keep an eye out.`
            : 'All quiet nearby. Thanks for watching out for our pets.'}
        </p>
      </section>

      {/* Alerts nudge */}
      {!prefs.alertsEnabled && (
        <Card className="mt-5 flex items-center gap-3 border-beacon-200/70 bg-beacon-50/80 p-4 animate-fade-up dark:bg-beacon-500/10">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-beacon-gradient text-white shadow-glow">
            <BellIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink dark:text-cream-50">Turn on nearby alerts</p>
            <p className="text-xs text-ink-muted dark:text-stone-400">
              Be the first to know if a pet goes missing near you.
            </p>
          </div>
          <Link href="/alerts">
            <Button size="sm">Enable</Button>
          </Link>
        </Card>
      )}

      {/* Quick actions */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/report/missing">
          <Card className="flex h-full flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:shadow-float">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-beacon-100 text-beacon-600 dark:bg-beacon-500/15">
              <PlusIcon className="h-5 w-5" />
            </span>
            <div className="mt-3">
              <p className="font-display text-[15px] font-bold text-ink dark:text-cream-50">
                Report missing
              </p>
              <p className="text-xs text-ink-muted dark:text-stone-400">Start the search</p>
            </div>
          </Card>
        </Link>
        <Link href="/report/found">
          <Card className="flex h-full flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:shadow-float">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-harbor-100 text-harbor-600 dark:bg-harbor-500/15">
              <EyeIcon className="h-5 w-5" />
            </span>
            <div className="mt-3">
              <p className="font-display text-[15px] font-bold text-ink dark:text-cream-50">Found a pet</p>
              <p className="text-xs text-ink-muted dark:text-stone-400">Help them home</p>
            </div>
          </Card>
        </Link>
      </section>

      {/* Nearby missing pets */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink dark:text-cream-50">Nearby pets</h2>
          <Link
            href="/nearby"
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-beacon-600 dark:text-beacon-400"
          >
            See all <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {nearby.length === 0 ? (
          <Card>
            <EmptyState
              illustration={<NeighbourhoodIllustration className="max-w-[220px]" />}
              title="No pets missing nearby"
              description="That's wonderful news. If you spot a lost pet, you can report a found pet to help them home."
              action={
                <Link href="/report/found">
                  <Button variant="secondary">Report a found pet</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {nearby.map((r) => (
              <PetCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </section>

      {/* Recently reunited */}
      {reunited.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <CelebrationBurst className="h-7 w-7" />
            <h2 className="font-display text-lg font-bold text-ink dark:text-cream-50">
              Recently reunited
            </h2>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
            {reunited.map((r) => (
              <PetCard key={r.id} report={r} className="w-40 shrink-0" />
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <SparkleIcon className="h-5 w-5 text-beacon-500" />
          <h2 className="font-display text-lg font-bold text-ink dark:text-cream-50">Helpful tips</h2>
        </div>
        <div className="space-y-3">
          {tips.map((tip) => (
            <Card key={tip.title} className="flex items-start gap-3 p-4">
              <PawPrint className="mt-0.5 h-5 w-5 shrink-0 text-beacon-400" />
              <div>
                <p className="text-sm font-bold text-ink dark:text-cream-50">{tip.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-muted dark:text-stone-400">
                  {tip.body}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-ink-muted/70">
        Beacon · Helping neighbours bring pets home
      </p>
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <Guard>
      <HomeContent />
    </Guard>
  );
}
