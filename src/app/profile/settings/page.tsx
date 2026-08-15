'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBeacon } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ChevronRightIcon } from '@/components/ui/icons';

function AccountSettingsContent() {
  const router = useRouter();
  const { user, isLive, deleteAccount } = useBeacon();
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

  return (
    <AppShell title="Account settings" back>
      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Account</p>
        <p className="mt-2 font-bold text-ink dark:text-cream-50">{user.name}</p>
        {user.email && <p className="text-sm text-ink-muted dark:text-stone-400">{user.email}</p>}
      </Card>

      <div className="mt-4">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Legal
        </p>
        <Card className="divide-y divide-stone-100 p-0 dark:divide-stone-800">
          <Link href="/privacy" className="flex items-center justify-between p-4">
            <span className="text-sm font-semibold text-ink-soft dark:text-stone-300">
              Privacy Policy
            </span>
            <ChevronRightIcon className="h-5 w-5 text-ink-muted" />
          </Link>
          <Link href="/terms" className="flex items-center justify-between p-4">
            <span className="text-sm font-semibold text-ink-soft dark:text-stone-300">
              Terms of Service
            </span>
            <ChevronRightIcon className="h-5 w-5 text-ink-muted" />
          </Link>
        </Card>
      </div>

      {isLive && (
        <div className="mt-8">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-rose-500">
            Danger zone
          </p>
          <Card className="border border-rose-200/70 p-5 dark:border-rose-500/20">
            <p className="font-bold text-ink dark:text-cream-50">Delete my account</p>
            <p className="mt-1 text-sm text-ink-muted dark:text-stone-400">
              Permanently delete your account, your reports and your saved areas. This cannot be
              undone.
            </p>
            <div className="mt-4">
              <Button variant="danger" onClick={() => setShowDelete(true)}>
                Delete my account
              </Button>
            </div>
          </Card>
        </div>
      )}

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
          This permanently deletes your account, your reports and your saved areas. Reunited pets and
          sightings you helped with stay in the community, but no longer show your name. This cannot
          be undone.
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

export default function AccountSettingsPage() {
  return (
    <Guard>
      <AccountSettingsContent />
    </Guard>
  );
}
