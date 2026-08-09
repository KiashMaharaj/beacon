'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useBeacon } from '@/lib/store';
import { foundReportSchema, type FoundReportForm } from '@/lib/schemas';
import { confidenceLabel, type ScoredMatch } from '@/lib/matching';
import type { PetReport } from '@/lib/types';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FieldError, FieldLabel, Input, Textarea } from '@/components/ui/Field';
import { ContactPrefPicker, SizePicker, SpeciesPicker } from '@/components/pets/FormControls';
import { LocationPicker } from '@/components/pets/LocationPicker';
import { ConsentCheckbox } from '@/components/pets/ConsentCheckbox';
import { PhotoUpload } from '@/components/pets/PhotoUpload';
import { PetPhoto } from '@/components/pets/PetPhoto';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CheckCircleIcon, SparkleIcon } from '@/components/ui/icons';
import { CelebrationBurst } from '@/components/illustrations/Scenery';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function MatchCard({ match, onNotify }: { match: ScoredMatch; onNotify: () => void | Promise<void> }) {
  const { report, score, reasons } = match;
  const label = confidenceLabel(score);
  const [notified, setNotified] = useState(false);

  const handleNotify = async () => {
    await onNotify();
    setNotified(true);
  };
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
          <PetPhoto photoUrl={report.photoUrl} species={report.species} alt={report.name ?? 'Pet'} rounded="rounded-2xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-bold text-ink dark:text-cream-50">{report.name}</h3>
            <Badge tone={label === 'Strong' ? 'success' : label === 'Possible' ? 'warning' : 'neutral'}>
              {score}% · {label}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted dark:text-stone-400">
            {[report.breed, report.colour].filter(Boolean).join(' · ')}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {reasons.slice(0, 3).map((r) => (
              <span
                key={r}
                className="rounded-full bg-harbor-50 px-2 py-0.5 text-[11px] font-medium text-harbor-700 dark:bg-harbor-500/10 dark:text-harbor-300"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 border-t border-stone-100 p-3 dark:border-stone-800">
        <Link href={`/pets/${report.id}`} className="flex-1">
          <Button variant="outline" size="sm" fullWidth>
            View pet
          </Button>
        </Link>
        <Button size="sm" fullWidth variant={notified ? 'outline' : 'primary'} onClick={handleNotify} disabled={notified}>
          {notified ? 'Owner notified ✓' : 'Notify owner'}
        </Button>
      </div>
    </Card>
  );
}

function FoundForm() {
  const router = useRouter();
  const { createReport, matchesForFound, notifyOwnerOfMatch } = useBeacon();
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [created, setCreated] = useState<PetReport | null>(null);
  const [matches, setMatches] = useState<ScoredMatch[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FoundReportForm>({
    resolver: zodResolver(foundReportSchema) as Resolver<FoundReportForm>,
    defaultValues: {
      species: 'dog',
      size: 'medium',
      stillHasPet: true,
      contactPref: 'in_app',
      contactValue: '',
      consent: false,
      foundDate: todayISO(),
      foundTime: nowTime(),
    },
  });
  const contactPref = watch('contactPref');

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const publish = async (data: FoundReportForm) => {
    setPublishing(true);
    setPublishError(null);
    const foundAt = new Date(`${data.foundDate}T${data.foundTime}`).toISOString();
    try {
      const report = await createReport({
        kind: 'found',
        species: data.species,
        breed: data.breed || null,
        colour: data.colour,
        size: data.size,
        photoUrl: data.photoUrl || null,
        lastSeenAt: foundAt,
        location: data.location,
        stillHasPet: data.stillHasPet,
        notes: data.notes || null,
        contactPref: data.contactPref,
        contactValue: data.contactValue?.trim() || null,
        contactConsent: data.consent,
      });
      setCreated(report);
      setMatches(matchesForFound(report));
      setStep('result');
      window.scrollTo({ top: 0 });
    } catch {
      setPublishError('We could not save your report. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  if (step === 'result' && created) {
    return (
      <AppShell title="Thank you" back={false} showNav>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center"
        >
          <CelebrationBurst className="h-40 w-40" />
          <h1 className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">
            You&apos;re a good neighbour
          </h1>
          <p className="mt-2 max-w-sm text-[15px] text-ink-muted dark:text-stone-400">
            Your found report is live. {matches.length > 0
              ? 'We found some pets that could be a match.'
              : 'We&apos;ll keep watching for a matching missing pet and notify you.'}
          </p>
        </motion.div>

        {matches.length > 0 ? (
          <section className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <SparkleIcon className="h-5 w-5 text-beacon-500" />
              <h2 className="font-display text-lg font-bold text-ink dark:text-cream-50">
                Likely matches ({matches.length})
              </h2>
            </div>
            <div className="space-y-3">
              {matches.map((m) => (
                <MatchCard
                  key={m.report.id}
                  match={m}
                  onNotify={() => notifyOwnerOfMatch(created.id, m.report.id, m.score)}
                />
              ))}
            </div>
          </section>
        ) : (
          <Card className="mt-8 flex items-center gap-3 p-4">
            <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-500" />
            <p className="text-sm text-ink-soft dark:text-stone-300">
              No matches right now. If a matching pet is reported missing nearby, we&apos;ll alert you
              straight away.
            </p>
          </Card>
        )}

        <div className="mt-8 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => router.replace('/home')}>
            Back home
          </Button>
          <Link href={`/pets/${created.id}`} className="flex-1">
            <Button fullWidth>View my report</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Found a pet" back>
      <p className="mt-1 text-sm text-ink-muted dark:text-stone-400">
        Tell us what you found. Beacon will compare it against nearby missing pets.
      </p>
      <form onSubmit={handleSubmit(publish)} className="mt-5 space-y-6 pb-4">
        <div>
          <FieldLabel>Photo</FieldLabel>
          <Controller
            control={control}
            name="photoUrl"
            render={({ field }) => <PhotoUpload value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div>
          <FieldLabel required>Species</FieldLabel>
          <Controller
            control={control}
            name="species"
            render={({ field }) => <SpeciesPicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="breed">Breed estimate</FieldLabel>
            <Input id="breed" placeholder="Best guess" {...register('breed')} />
          </div>
          <div>
            <FieldLabel htmlFor="colour" required>
              Colour
            </FieldLabel>
            <Input id="colour" placeholder="e.g. Black & white" {...register('colour')} />
            <FieldError>{errors.colour?.message}</FieldError>
          </div>
        </div>

        <div>
          <FieldLabel required>Size</FieldLabel>
          <Controller
            control={control}
            name="size"
            render={({ field }) => <SizePicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="foundDate" required>
              When found
            </FieldLabel>
            <Input id="foundDate" type="date" max={todayISO()} {...register('foundDate')} />
            <FieldError>{errors.foundDate?.message}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="foundTime" required>
              Time
            </FieldLabel>
            <Input id="foundTime" type="time" {...register('foundTime')} />
            <FieldError>{errors.foundTime?.message}</FieldError>
          </div>
        </div>

        <div>
          <FieldLabel required>Where did you find them?</FieldLabel>
          <Controller
            control={control}
            name="location"
            render={({ field }) => <LocationPicker value={field.value} onChange={field.onChange} />}
          />
          <FieldError>{errors.location?.message as string}</FieldError>
        </div>

        <div>
          <FieldLabel>Do you still have the pet?</FieldLabel>
          <Controller
            control={control}
            name="stillHasPet"
            render={({ field }) => (
              <SegmentedControl
                options={[
                  { value: 'yes', label: 'Yes, with me' },
                  { value: 'no', label: 'No, it ran off' },
                ]}
                value={field.value ? 'yes' : 'no'}
                onChange={(v) => field.onChange(v === 'yes')}
              />
            )}
          />
        </div>

        <div>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" placeholder="Anything helpful: collar, behaviour, where they are now…" {...register('notes')} />
        </div>

        <div>
          <FieldLabel>How should the owner reach you?</FieldLabel>
          <Controller
            control={control}
            name="contactPref"
            render={({ field }) => <ContactPrefPicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        {contactPref !== 'in_app' && (
          <div>
            <FieldLabel htmlFor="contactValue" required>
              {contactPref === 'phone' ? 'Phone number to share' : 'Email to share'}
            </FieldLabel>
            <Input
              id="contactValue"
              type={contactPref === 'phone' ? 'tel' : 'email'}
              inputMode={contactPref === 'phone' ? 'tel' : 'email'}
              placeholder={contactPref === 'phone' ? 'e.g. 072 123 4567' : 'e.g. you@example.com'}
              {...register('contactValue')}
            />
            <FieldError>{errors.contactValue?.message}</FieldError>
          </div>
        )}

        <ConsentCheckbox registration={register('consent')} error={errors.consent?.message} />

        {publishError && (
          <p className="rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10">
            {publishError}
          </p>
        )}
        <Button type="submit" fullWidth size="lg" loading={publishing}>
          Find matches
        </Button>
      </form>
    </AppShell>
  );
}

export default function ReportFoundPage() {
  return (
    <Guard>
      <FoundForm />
    </Guard>
  );
}
