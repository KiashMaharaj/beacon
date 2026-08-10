'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBeacon } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/Feedback';
import { PetCard } from '@/components/pets/PetCard';
import { PawPrint } from '@/components/illustrations/Pets';
import { HeartIcon, BellIcon, EyeIcon, ShieldIcon, ChevronRightIcon } from '@/components/ui/icons';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">{value}</p>
      <p className="text-xs text-ink-muted dark:text-stone-400">{label}</p>
    </div>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user, reports, signOut, isAdmin, isLive, deleteAccount } = useBeacon();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      router.replace('/welcome');
    } catch (err) {
      setDeleting(false);
      setDeleteError(
        err instanceof Error ? err.message : 'Could not delete your account. Please try again.',
      );
    }
  };

  const mine = useMemo(() => reports.filter((r) => r.reporterId === user.id), [reports, user.id]);
  const reunions = mine.filter((r) => r.status === 'reunited').length;
  const sightingsGiven = useMemo(
    () =>
      reports.reduce(
        (acc, r) => acc + (r.sightings?.filter((s) => s.reporter?.id === user.id).length ?? 0),
        0,
      ),
    [reports, user.id],
  );

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  return (
    <AppShell title="Profile">
      <Card className="flex flex-col items-center p-6 text-center">
        <Avatar name={user.name} src={user.avatarUrl} size={72} />
        <h1 className="mt-3 font-display text-xl font-extrabold text-ink dark:text-cream-50">
          {user.name}
        </h1>
        <p className="text-sm text-ink-muted dark:text-stone-400">Good neighbour · Beacon member</p>

        <div className="mt-5 flex w-full divide-x divide-stone-100 dark:divide-stone-800">
          <Stat value={mine.length} label="Reports" />
          <Stat value={reunions} label="Reunions" />
          <Stat value={sightingsGiven} label="Sightings" />
        </div>
      </Card>

      {/* Quick links */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Link href="/alerts">
          <Card className="flex flex-col items-center gap-1.5 p-4 transition hover:-translate-y-0.5">
            <BellIcon className="h-5 w-5 text-beacon-500" />
            <span className="text-xs font-semibold text-ink-soft dark:text-stone-300">Alerts</span>
          </Card>
        </Link>
        <Link href="/report/found">
          <Card className="flex flex-col items-center gap-1.5 p-4 transition hover:-translate-y-0.5">
            <EyeIcon className="h-5 w-5 text-harbor-600" />
            <span className="text-xs font-semibold text-ink-soft dark:text-stone-300">Found</span>
          </Card>
        </Link>
        <Link href="/nearby">
          <Card className="flex flex-col items-center gap-1.5 p-4 transition hover:-translate-y-0.5">
            <HeartIcon className="h-5 w-5 text-rose-500" />
            <span className="text-xs font-semibold text-ink-soft dark:text-stone-300">Nearby</span>
          </Card>
        </Link>
      </div>

      {/* Admin */}
      {isAdmin && (
        <Link href="/admin">
          <Card className="mt-4 flex items-center gap-3 p-4 transition hover:-translate-y-0.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-beacon-gradient text-white shadow-glow">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink dark:text-cream-50">Admin dashboard</p>
              <p className="text-xs text-ink-muted dark:text-stone-400">
                Moderate and remove any report or sighting.
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-ink-muted" />
          </Card>
        </Link>
      )}

      {/* My reports */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink dark:text-cream-50">My reports</h2>
        {mine.length === 0 ? (
          <Card>
            <EmptyState
              illustration={<PawPrint className="h-14 w-14 text-beacon-300" />}
              title="No reports yet"
              description="When you report a missing or found pet, it'll appear here."
              action={
                <Link href="/report">
                  <Button>Report a pet</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {mine.map((r) => (
              <PetCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button variant="outline" fullWidth onClick={handleSignOut}>
          Sign out
        </Button>
        {isLive && (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="mt-4 w-full text-center text-sm font-semibold text-rose-500 hover:text-rose-600"
          >
            Delete my account
          </button>
        )}
        <p className="mt-6 text-center text-xs text-ink-muted/70">
          Beacon v1.0 · Helping neighbours bring pets home
        </p>
        <p className="mt-2 text-center text-xs text-ink-muted/70">
          <Link href="/privacy" className="underline hover:text-ink-soft">
            Privacy Policy
          </Link>{' '}
          ·{' '}
          <Link href="/terms" className="underline hover:text-ink-soft">
            Terms of Service
          </Link>
        </p>
      </div>

      <DeleteAccountModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteAccount}
        deleting={deleting}
        error={deleteError}
      />
    </AppShell>
  );
}

function DeleteAccountModal({
  open,
  onClose,
  onConfirm,
  deleting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
  error: string | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Delete your account?">
      <div className="space-y-4">
        <p className="text-sm text-ink-soft dark:text-stone-300">
          This permanently deletes your account, your reports and your saved areas. Reunited pets
          and sightings you helped with stay in the community, but no longer show your name. This
          cannot be undone.
        </p>
        {error && (
          <p className="rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm} loading={deleting}>
            Delete forever
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ProfilePage() {
  return (
    <Guard>
      <ProfileContent />
    </Guard>
  );
}
