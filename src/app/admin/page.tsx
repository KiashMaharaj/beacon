'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBeacon } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/Feedback';
import { PetPhoto } from '@/components/pets/PetPhoto';
import { LogoMark } from '@/components/brand/Logo';
import { PawPrint } from '@/components/illustrations/Pets';
import { SearchIcon } from '@/components/ui/icons';
import { speciesLabel, timeAgo } from '@/lib/format';
import type { Flag, PetReport } from '@/lib/types';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">{value}</p>
      <p className="text-xs text-ink-muted dark:text-stone-400">{label}</p>
    </div>
  );
}

function AdminContent() {
  const { reports, markReunited, deleteReport, deleteSighting, fetchFlags, dismissFlag } =
    useBeacon();
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);

  useEffect(() => {
    let active = true;
    fetchFlags().then((f) => {
      if (active) setFlags(f);
    });
    return () => {
      active = false;
    };
  }, [fetchFlags]);

  const flaggedGroups = useMemo(() => {
    const byReport = new Map<string, { report?: PetReport; flags: Flag[] }>();
    for (const f of flags) {
      const group = byReport.get(f.reportId) ?? {
        report: reports.find((r) => r.id === f.reportId),
        flags: [],
      };
      group.flags.push(f);
      byReport.set(f.reportId, group);
    }
    return [...byReport.values()];
  }, [flags, reports]);

  const dismissGroup = async (group: { flags: Flag[] }) => {
    const ids = group.flags.map((f) => f.id);
    await Promise.all(ids.map((id) => dismissFlag(id)));
    setFlags((prev) => prev.filter((f) => !ids.includes(f.id)));
  };

  const stats = useMemo(() => {
    const active = reports.filter((r) => r.status === 'active').length;
    const reunited = reports.filter((r) => r.status === 'reunited').length;
    const sightings = reports.reduce((n, r) => n + (r.sightings?.length ?? 0), 0);
    return { total: reports.length, active, reunited, sightings };
  }, [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (!q) return list;
    return list.filter((r) =>
      [r.name, r.breed, r.colour, r.species, r.location?.label, r.reporter?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [reports, query]);

  const allSightings = useMemo(
    () =>
      reports
        .flatMap((r) => (r.sightings ?? []).map((s) => ({ report: r, sighting: s })))
        .sort((a, b) => new Date(b.sighting.createdAt).getTime() - new Date(a.sighting.createdAt).getTime()),
    [reports],
  );

  const removeReport = async (id: string) => {
    if (!window.confirm('Delete this report permanently? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await deleteReport(id);
    } catch {
      window.alert('Could not delete this report.');
    } finally {
      setBusyId(null);
    }
  };

  const removeSighting = async (reportId: string, sightingId: string) => {
    if (!window.confirm('Delete this sighting?')) return;
    setBusyId(sightingId);
    try {
      await deleteSighting(reportId, sightingId);
    } catch {
      window.alert('Could not delete this sighting.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppShell title="Admin">
      <p className="text-sm text-ink-muted dark:text-stone-400">
        Moderate everything on Beacon. Deletions are permanent and apply for all neighbours.
      </p>

      <Card className="mt-4 flex p-4">
        <Stat value={stats.total} label="Reports" />
        <Stat value={stats.active} label="Active" />
        <Stat value={stats.reunited} label="Reunited" />
        <Stat value={stats.sightings} label="Sightings" />
      </Card>

      {/* Flagged content */}
      {flaggedGroups.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold text-rose-600 dark:text-rose-400">
            Flagged content ({flaggedGroups.length})
          </h2>
          <div className="space-y-3">
            {flaggedGroups.map((group, i) => (
              <Card key={group.report?.id ?? i} className="border-rose-200 p-4 dark:border-rose-500/30">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-bold text-ink dark:text-cream-50">
                    {group.report
                      ? group.report.name ?? `Found ${speciesLabel(group.report.species).toLowerCase()}`
                      : 'Deleted report'}
                  </p>
                  <Badge tone="warning">{group.flags.length} flag{group.flags.length > 1 ? 's' : ''}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.flags.map((f) => (
                    <span
                      key={f.id}
                      className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                    >
                      {f.reason ?? 'Reported'}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  {group.report && (
                    <Link href={`/pets/${group.report.id}`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth>
                        View
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => dismissGroup(group)} className="flex-1">
                    Dismiss
                  </Button>
                  {group.report && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={busyId === group.report.id}
                      onClick={() => group.report && removeReport(group.report.id)}
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reports */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink dark:text-cream-50">All reports</h2>
        <div className="relative mb-3">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports…"
            className="pl-11"
            aria-label="Search reports"
          />
        </div>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              illustration={<PawPrint className="h-14 w-14 text-beacon-300" />}
              title="Nothing to moderate"
              description="Reports will appear here as neighbours post them."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <div className="flex gap-3 p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    <PetPhoto photoUrl={r.photoUrl} species={r.species} alt={r.name ?? 'Pet'} rounded="rounded-2xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display font-bold text-ink dark:text-cream-50">
                        {r.name ?? `Found ${speciesLabel(r.species).toLowerCase()}`}
                      </h3>
                      <Badge tone={r.kind === 'found' ? 'harbor' : 'neutral'}>{r.kind}</Badge>
                      <Badge tone={r.status === 'reunited' ? 'success' : 'warning'}>{r.status}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted dark:text-stone-400">
                      {[r.breed, r.colour, r.location?.label].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted dark:text-stone-400">
                      by {r.reporter?.name ?? 'Unknown'} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-stone-100 p-2.5 dark:border-stone-800">
                  <Link href={`/pets/${r.id}`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth>
                      View
                    </Button>
                  </Link>
                  {r.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markReunited(r.id)}
                      className="flex-1"
                    >
                      Mark reunited
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    loading={busyId === r.id}
                    onClick={() => removeReport(r.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sightings */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink dark:text-cream-50">
          All sightings ({allSightings.length})
        </h2>
        {allSightings.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-ink-muted dark:text-stone-400">No sightings reported yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {allSightings.map(({ report, sighting }) => (
              <Card key={sighting.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink dark:text-cream-50">
                    {sighting.notes || 'Sighting reported'}
                  </p>
                  <p className="truncate text-xs text-ink-muted dark:text-stone-400">
                    on <Link href={`/pets/${report.id}`} className="underline">{report.name ?? 'a pet'}</Link>
                    {sighting.location?.label ? ` · ${sighting.location.label}` : ''} · {timeAgo(sighting.createdAt)}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  loading={busyId === sighting.id}
                  onClick={() => removeSighting(report.id, sighting.id)}
                >
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { ready, signedIn, isAdmin } = useBeacon();

  useEffect(() => {
    if (ready && (!signedIn || !isAdmin)) router.replace('/home');
  }, [ready, signedIn, isAdmin, router]);

  if (!ready || !signedIn || !isAdmin) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <LogoMark className="h-14 w-14 animate-float" />
        <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-beacon-200 border-t-beacon-500" />
      </div>
    );
  }

  return <AdminContent />;
}
