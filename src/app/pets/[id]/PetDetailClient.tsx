'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBeacon } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Feedback';
import { PetPhoto } from '@/components/pets/PetPhoto';
import { StatusBadge } from '@/components/pets/StatusBadge';
import { MapView } from '@/components/pets/MapView';
import { CelebrationBurst } from '@/components/illustrations/Scenery';
import { PawPrint } from '@/components/illustrations/Pets';
import {
  ClockIcon,
  EyeIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  ShareIcon,
  CheckCircleIcon,
} from '@/components/ui/icons';
import { prettyDate, sizeLabel, speciesLabel, timeAgo, timeMissing } from '@/lib/format';
import { formatDistance } from '@/lib/geo';
import { shareReport } from '@/lib/share';

const FLAG_REASONS = [
  'Spam or fake',
  'Inappropriate content',
  'Wrong or misleading',
  'Duplicate post',
  'Something else',
];

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-ink-muted dark:text-stone-400">{label}</span>
      <span className="text-sm font-semibold text-ink dark:text-cream-50">{value}</span>
    </div>
  );
}

function PetDetailContent() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { getReport, withDistance, markReunited, deleteReport, flagReport, user, isAdmin } =
    useBeacon();

  const [showContact, setShowContact] = useState(false);
  const [showReunion, setShowReunion] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagging, setFlagging] = useState(false);
  const [flagDone, setFlagDone] = useState(false);

  const base = getReport(params.id);
  const report = useMemo(() => (base ? withDistance([base])[0] : undefined), [base, withDistance]);

  if (!report) {
    return (
      <AppShell title="Pet" back>
        <Card className="mt-6">
          <EmptyState
            illustration={<PawPrint className="h-16 w-16 text-beacon-300" />}
            title="This pet isn't here"
            description="The report may have been removed or reunited."
            action={
              <Link href="/nearby">
                <Button>Browse nearby pets</Button>
              </Link>
            }
          />
        </Card>
      </AppShell>
    );
  }

  const isOwner = report.reporterId === user.id;
  const justPublished = search.get('published') === '1';
  const title =
    report.name ?? (report.kind === 'found' ? `Found ${speciesLabel(report.species).toLowerCase()}` : 'Unnamed pet');

  const sightings = report.sightings ?? [];

  const timeline = [
    ...(report.reunitedAt
      ? [{ icon: 'heart' as const, label: 'Reunited with their family', at: report.reunitedAt }]
      : []),
    ...sightings.map((s) => ({
      icon: 'eye' as const,
      label: s.notes || 'Sighting reported',
      at: s.seenAt,
      place: s.location?.label,
    })),
    {
      icon: report.kind === 'found' ? ('eye' as const) : ('pin' as const),
      label: report.kind === 'found' ? 'Reported found' : 'Reported missing',
      at: report.createdAt,
      place: report.location?.label,
    },
  ];

  const handleReunion = async () => {
    await markReunited(report.id);
    setCelebrated(true);
  };

  const handleShare = async () => {
    const result = await shareReport(report);
    if (result === 'copied') alert('Link copied. Share it with your neighbours!');
  };

  const submitFlag = async () => {
    setFlagging(true);
    try {
      await flagReport(report.id, flagReason || 'Reported');
      setFlagDone(true);
    } finally {
      setFlagging(false);
    }
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Remove this report permanently? This cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await deleteReport(report.id);
      router.replace(isOwner ? '/profile' : '/nearby');
    } catch {
      setDeleting(false);
      alert('Sorry, we could not remove this report. Please try again.');
    }
  };

  return (
    <AppShell
      title={title}
      back
      action={
        <button
          onClick={handleShare}
          aria-label="Share"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-ink-soft shadow-soft transition hover:scale-105 dark:border-stone-700 dark:bg-stone-800/70 dark:text-cream-50"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
      }
    >
      {justPublished && !report.reunitedAt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10"
        >
          <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-bold text-ink dark:text-cream-50">Your beacon is live</p>
            <p className="text-xs text-ink-muted dark:text-stone-400">
              Neighbours within {report.alertRadiusKm} km are being alerted.
            </p>
          </div>
        </motion.div>
      )}

      {/* Hero */}
      <div className="overflow-hidden rounded-4xl shadow-card">
        <div className="relative aspect-[4/3]">
          <PetPhoto photoUrl={report.photoUrl} species={report.species} alt={title} rounded="rounded-none" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
            <div className="flex items-center gap-2">
              <StatusBadge report={report} />
              {report.distanceKm != null && (
                <Badge tone="neutral" className="bg-black/40 text-white">
                  <MapPinIcon className="h-3.5 w-3.5" /> {formatDistance(report.distanceKm)}
                </Badge>
              )}
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold text-white drop-shadow">{title}</h1>
          </div>
        </div>
      </div>

      {/* Time missing banner */}
      {report.status === 'active' && report.kind === 'missing' && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-beacon-50 py-2.5 text-sm font-semibold text-beacon-700 dark:bg-beacon-500/10 dark:text-beacon-300">
          <ClockIcon className="h-4 w-4" />
          Missing for {timeMissing(report.lastSeenAt)}
        </div>
      )}

      {/* Reporter */}
      <Card className="mt-4 flex items-center gap-3 p-4">
        <Avatar name={report.reporter?.name ?? 'Neighbour'} src={report.reporter?.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink dark:text-cream-50">
            {report.reporter?.name ?? 'A neighbour'}
          </p>
          <p className="text-xs text-ink-muted dark:text-stone-400">
            {report.kind === 'found' ? 'Found this pet' : 'Reported this pet'} · {timeAgo(report.createdAt)}
          </p>
        </div>
        {!isOwner && (
          <Button size="sm" variant="outline" onClick={() => setShowContact(true)}>
            Contact
          </Button>
        )}
      </Card>

      {/* Details */}
      <Card className="mt-4 px-4 py-1">
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          <DetailRow label="Species" value={speciesLabel(report.species)} />
          <DetailRow label="Breed" value={report.breed} />
          <DetailRow label="Colour" value={report.colour} />
          <DetailRow label="Age" value={report.age} />
          <DetailRow label="Size" value={sizeLabel(report.size)} />
          <DetailRow
            label={report.kind === 'found' ? 'Found' : 'Last seen'}
            value={prettyDate(report.lastSeenAt)}
          />
          {report.kind === 'found' && (
            <DetailRow label="Still has pet" value={report.stillHasPet ? 'Yes, with finder' : 'No, ran off'} />
          )}
        </div>
      </Card>

      {(report.description || report.notes) && (
        <Card className="mt-4 p-4">
          <h2 className="mb-1.5 font-display font-bold text-ink dark:text-cream-50">About</h2>
          <p className="text-sm leading-relaxed text-ink-soft dark:text-stone-300">
            {report.description || report.notes}
          </p>
        </Card>
      )}

      {/* Map */}
      {report.location && (
        <div className="mt-4">
          <h2 className="mb-2 font-display font-bold text-ink dark:text-cream-50">
            {report.kind === 'found' ? 'Where they were found' : 'Last seen here'}
          </h2>
          <MapView
            center={report.location}
            radiusKm={report.kind === 'missing' ? report.alertRadiusKm : null}
            sightings={sightings.map((s) => s.location).filter(Boolean) as { lat: number; lng: number }[]}
          />
          {report.location.label && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
              <MapPinIcon className="h-4 w-4" /> {report.location.label}
            </p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="mt-6">
        <h2 className="mb-3 font-display font-bold text-ink dark:text-cream-50">Timeline</h2>
        <div className="space-y-0">
          {timeline.map((t, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    t.icon === 'heart'
                      ? 'bg-rose-100 text-rose-500 dark:bg-rose-500/15'
                      : t.icon === 'eye'
                        ? 'bg-harbor-100 text-harbor-600 dark:bg-harbor-500/15'
                        : 'bg-beacon-100 text-beacon-600 dark:bg-beacon-500/15'
                  }`}
                >
                  {t.icon === 'heart' ? (
                    <HeartIcon className="h-4 w-4" />
                  ) : t.icon === 'eye' ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <MapPinIcon className="h-4 w-4" />
                  )}
                </span>
                {i < timeline.length - 1 && <span className="my-1 w-0.5 flex-1 bg-stone-200 dark:bg-stone-700" />}
              </div>
              <div className="pb-5">
                <p className="text-sm font-semibold text-ink dark:text-cream-50">{t.label}</p>
                <p className="text-xs text-ink-muted dark:text-stone-400">
                  {timeAgo(t.at)}
                  {'place' in t && t.place ? ` · ${t.place}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sightings summary */}
      <Card className="mt-2 flex items-center gap-3 p-4">
        <EyeIcon className="h-5 w-5 text-harbor-600" />
        <p className="flex-1 text-sm text-ink-soft dark:text-stone-300">
          {sightings.length > 0
            ? `${sightings.length} sighting${sightings.length > 1 ? 's' : ''} reported by neighbours`
            : 'No sightings yet. Seen this pet? Let the owner know.'}
        </p>
      </Card>

      {/* Sticky actions */}
      {report.status === 'active' && (
        <div className="sticky bottom-24 z-20 mt-6 flex gap-3">
          <Link href={`/pets/${report.id}/sighting`} className="flex-1">
            <Button variant="secondary" fullWidth size="lg">
              <EyeIcon className="h-5 w-5" /> I saw this pet
            </Button>
          </Link>
          {isOwner ? (
            <Button size="lg" onClick={() => setShowReunion(true)}>
              <HeartIcon className="h-5 w-5" /> Mark found
            </Button>
          ) : (
            <Button size="lg" onClick={() => setShowContact(true)}>
              Contact
            </Button>
          )}
        </div>
      )}

      {/* Owner / admin: edit or remove report */}
      {(isOwner || isAdmin) && (
        <div className="mt-8 flex items-center justify-center gap-5">
          <Link
            href={`/pets/${report.id}/edit`}
            className="text-sm font-semibold text-beacon-600 underline underline-offset-2 hover:text-beacon-700 dark:text-beacon-400"
          >
            Edit report
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-semibold text-rose-500 underline underline-offset-2 hover:text-rose-600 disabled:opacity-60"
          >
            {deleting
              ? 'Removing…'
              : isAdmin && !isOwner
                ? 'Remove this report (admin)'
                : 'Remove this report'}
          </button>
        </div>
      )}

      {/* Everyone else: report/flag for moderation */}
      {!isOwner && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setShowFlag(true)}
            className="text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-rose-500"
          >
            Report this post
          </button>
        </div>
      )}

      {/* Flag modal */}
      <Modal
        open={showFlag}
        onClose={() => {
          setShowFlag(false);
          setFlagDone(false);
          setFlagReason('');
        }}
        title={flagDone ? undefined : 'Report this post'}
      >
        {flagDone ? (
          <div className="py-4 text-center">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15">
              <CheckCircleIcon className="h-9 w-9" />
            </span>
            <h2 className="font-display text-xl font-extrabold text-ink dark:text-cream-50">
              Thanks for flagging
            </h2>
            <p className="mt-2 text-sm text-ink-muted dark:text-stone-400">
              Our team will take a look. Thank you for keeping Beacon kind and helpful.
            </p>
            <Button
              fullWidth
              className="mt-6"
              onClick={() => {
                setShowFlag(false);
                setFlagDone(false);
                setFlagReason('');
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-ink-muted dark:text-stone-400">
              Why are you reporting this? It goes to our moderators, privately.
            </p>
            <div className="mt-2 space-y-2">
              {FLAG_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setFlagReason(reason)}
                  aria-pressed={flagReason === reason}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    flagReason === reason
                      ? 'border-beacon-400 bg-beacon-50 dark:border-beacon-500 dark:bg-beacon-500/15'
                      : 'border-stone-200 bg-white/70 dark:border-stone-700 dark:bg-stone-900/50'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      flagReason === reason ? 'border-beacon-500 bg-beacon-500' : 'border-stone-300'
                    }`}
                  >
                    {flagReason === reason && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-ink dark:text-cream-50">{reason}</span>
                </button>
              ))}
            </div>
            <Button
              fullWidth
              size="lg"
              className="mt-4"
              loading={flagging}
              disabled={!flagReason}
              onClick={submitFlag}
            >
              Submit report
            </Button>
          </div>
        )}
      </Modal>

      {/* Contact modal */}
      <Modal
        open={showContact}
        onClose={() => setShowContact(false)}
        title={`Reach ${report.reporter?.name ?? 'the owner'}`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-beacon-50 p-4 dark:bg-beacon-500/10">
            <Avatar name={report.reporter?.name ?? 'Neighbour'} size={44} />
            <div>
              <p className="font-bold text-ink dark:text-cream-50">{report.reporter?.name}</p>
              <p className="text-xs text-ink-muted dark:text-stone-400">
                {report.contactPref === 'phone'
                  ? 'Prefers a phone call or text'
                  : report.contactPref === 'email'
                    ? 'Prefers email'
                    : 'Prefers to be reached through sightings'}
              </p>
            </div>
          </div>

          {report.contactPref === 'phone' && report.contactValue ? (
            <a href={`tel:${report.contactValue.replace(/\s+/g, '')}`} className="block">
              <Button fullWidth size="lg">
                <PhoneIcon className="h-5 w-5" /> Call {report.contactValue}
              </Button>
            </a>
          ) : report.contactPref === 'email' && report.contactValue ? (
            <a href={`mailto:${report.contactValue}`} className="block">
              <Button fullWidth size="lg">
                Email {report.reporter?.name ?? 'the owner'}
              </Button>
            </a>
          ) : (
            <>
              <p className="text-sm text-ink-soft dark:text-stone-300">
                To protect privacy, Beacon only shares the details a neighbour chooses to. The best
                way to help is to report a sighting - {report.reporter?.name ?? 'the owner'} is
                notified right away.
              </p>
              <Link href={`/pets/${report.id}/sighting`} onClick={() => setShowContact(false)}>
                <Button fullWidth size="lg">
                  <EyeIcon className="h-5 w-5" /> Report a sighting
                </Button>
              </Link>
            </>
          )}

          <p className="text-center text-xs text-ink-muted">
            Only the details neighbours choose to share are ever shown.
          </p>
        </div>
      </Modal>

      {/* Reunion confirm / celebration modal */}
      <Modal
        open={showReunion}
        onClose={() => {
          setShowReunion(false);
          if (celebrated) router.replace('/home');
        }}
      >
        {!celebrated ? (
          <div className="text-center">
            <h2 className="font-display text-xl font-extrabold text-ink dark:text-cream-50">
              Is {title} home safe?
            </h2>
            <p className="mt-2 text-sm text-ink-muted dark:text-stone-400">
              Marking as found lets everyone celebrate and stops the alerts.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowReunion(false)}>
                Not yet
              </Button>
              <Button fullWidth onClick={handleReunion}>
                Yes, reunited! 🎉
              </Button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <CelebrationBurst className="mx-auto h-44 w-44" />
            <h2 className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">
              Welcome home, {title}! 🏡
            </h2>
            <p className="mt-2 text-sm text-ink-muted dark:text-stone-400">
              Another happy reunion, thanks to good neighbours.
            </p>
            <Button
              fullWidth
              size="lg"
              className="mt-6"
              onClick={() => {
                setShowReunion(false);
                router.replace('/home');
              }}
            >
              Wonderful
            </Button>
          </motion.div>
        )}
      </Modal>
    </AppShell>
  );
}

export function PetDetailClient() {
  return (
    <Guard>
      <PetDetailContent />
    </Guard>
  );
}
