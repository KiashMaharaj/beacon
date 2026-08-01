'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useBeacon } from '@/lib/store';
import { sightingSchema, type SightingForm } from '@/lib/schemas';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FieldError, FieldLabel, Input, Textarea } from '@/components/ui/Field';
import { LocationPicker } from '@/components/pets/LocationPicker';
import { PhotoUpload } from '@/components/pets/PhotoUpload';
import { PetPhoto } from '@/components/pets/PetPhoto';
import { CheckCircleIcon } from '@/components/ui/icons';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function SightingContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getReport, addSighting, user } = useBeacon();
  const report = getReport(params.id);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SightingForm>({
    resolver: zodResolver(sightingSchema) as Resolver<SightingForm>,
    defaultValues: { seenDate: todayISO(), seenTime: nowTime() },
  });

  if (!report) {
    router.replace('/nearby');
    return null;
  }

  const title = report.name ?? 'this pet';

  const submit = async (data: SightingForm) => {
    setSending(true);
    setSendError(null);
    const seenAt = new Date(`${data.seenDate}T${data.seenTime}`).toISOString();
    try {
      await addSighting(report.id, {
        reporter: { id: user.id, name: user.name },
        seenAt,
        location: data.location,
        photoUrl: data.photoUrl || null,
        notes: data.notes || null,
      });
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch {
      setSendError('We could not send your sighting. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <AppShell title="Sighting sent" back={false}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-8 text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15"
          >
            <CheckCircleIcon className="h-14 w-14" />
          </motion.span>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-ink dark:text-cream-50">
            Thank you!
          </h1>
          <p className="mt-2 max-w-xs text-[15px] text-ink-muted dark:text-stone-400">
            {report.reporter?.name ?? 'The owner'} has been notified of your sighting of {title}. Every
            report brings them closer to home.
          </p>
        </motion.div>

        <div className="mt-4 flex flex-col gap-3">
          <Link href={`/pets/${report.id}`}>
            <Button fullWidth size="lg">
              Back to {title}
            </Button>
          </Link>
          <Link href="/nearby">
            <Button variant="ghost" fullWidth>
              Browse more pets
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`I saw ${title}`} back>
      <Card className="mt-1 flex items-center gap-3 p-3">
        <div className="h-14 w-14 overflow-hidden rounded-2xl">
          <PetPhoto photoUrl={report.photoUrl} species={report.species} alt={title} rounded="rounded-2xl" />
        </div>
        <div>
          <p className="font-display font-bold text-ink dark:text-cream-50">{title}</p>
          <p className="text-xs text-ink-muted dark:text-stone-400">
            Share what you saw. It really helps.
          </p>
        </div>
      </Card>

      <form onSubmit={handleSubmit(submit)} className="mt-5 space-y-6 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="seenDate" required>
              Date seen
            </FieldLabel>
            <Input id="seenDate" type="date" max={todayISO()} {...register('seenDate')} />
            <FieldError>{errors.seenDate?.message}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="seenTime" required>
              Time
            </FieldLabel>
            <Input id="seenTime" type="time" {...register('seenTime')} />
            <FieldError>{errors.seenTime?.message}</FieldError>
          </div>
        </div>

        <div>
          <FieldLabel hint="Where exactly?">Location</FieldLabel>
          <Controller
            control={control}
            name="location"
            render={({ field }) => <LocationPicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div>
          <FieldLabel>Photo (if you managed one)</FieldLabel>
          <Controller
            control={control}
            name="photoUrl"
            render={({ field }) => <PhotoUpload value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Which direction were they heading? How did they seem?"
            {...register('notes')}
          />
        </div>

        {sendError && (
          <p className="rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10">
            {sendError}
          </p>
        )}
        <Button type="submit" fullWidth size="lg" loading={sending}>
          Send sighting
        </Button>
      </form>
    </AppShell>
  );
}

export default function SightingPage() {
  return (
    <Guard>
      <SightingContent />
    </Guard>
  );
}
