'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useBeacon } from '@/lib/store';
import { missingReportSchema, type MissingReportForm } from '@/lib/schemas';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FieldError, FieldLabel, Input, Textarea } from '@/components/ui/Field';
import {
  ContactPrefPicker,
  RadiusPicker,
  SizePicker,
  SpeciesPicker,
} from '@/components/pets/FormControls';
import { LocationPicker } from '@/components/pets/LocationPicker';
import { ConsentCheckbox } from '@/components/pets/ConsentCheckbox';
import { PhotoUpload } from '@/components/pets/PhotoUpload';
import { PetPhoto } from '@/components/pets/PetPhoto';
import { MapView } from '@/components/pets/MapView';
import { MapPinIcon } from '@/components/ui/icons';
import { prettyDate } from '@/lib/format';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function MissingForm() {
  const router = useRouter();
  const { createReport } = useBeacon();
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [publishError, setPublishError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MissingReportForm>({
    resolver: zodResolver(missingReportSchema) as Resolver<MissingReportForm>,
    defaultValues: {
      species: 'dog',
      size: 'medium',
      alertRadiusKm: 3,
      contactPref: 'in_app',
      contactValue: '',
      consent: false,
      lastSeenDate: todayISO(),
      lastSeenTime: nowTime(),
    },
  });

  const values = watch();

  const goPreview = () => setStep('preview');

  const [publishing, setPublishing] = useState(false);

  const publish = async (data: MissingReportForm) => {
    setPublishing(true);
    const lastSeenAt = new Date(`${data.lastSeenDate}T${data.lastSeenTime}`).toISOString();
    try {
      const report = await createReport({
        kind: 'missing',
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        colour: data.colour,
        age: data.age || null,
        size: data.size,
        description: data.description || null,
        photoUrl: data.photoUrl || null,
        lastSeenAt,
        location: data.location,
        alertRadiusKm: data.alertRadiusKm,
        contactPref: data.contactPref,
        contactValue: data.contactValue?.trim() || null,
        contactConsent: data.consent,
      });
      router.replace(`/pets/${report.id}?published=1`);
    } catch {
      setPublishing(false);
      setPublishError('We could not publish your beacon. Please try again.');
    }
  };

  if (step === 'preview') {
    const lastSeenAt = new Date(`${values.lastSeenDate}T${values.lastSeenTime}`).toISOString();
    return (
      <AppShell title="Preview" back>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-ink-muted dark:text-stone-400">
            Here&apos;s how neighbours will see your beacon. Looks right?
          </p>

          <Card className="mt-4 overflow-hidden">
            <div className="aspect-[4/3]">
              <PetPhoto photoUrl={values.photoUrl} species={values.species} alt={values.name || 'Pet'} rounded="rounded-none" />
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl font-extrabold text-ink dark:text-cream-50">
                {values.name}
              </h2>
              <p className="mt-1 text-sm text-ink-muted dark:text-stone-400">
                {[values.breed, values.colour, values.size].filter(Boolean).join(' · ')}
              </p>
              {values.description && (
                <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-stone-300">
                  {values.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
                <MapPinIcon className="h-4 w-4" />
                {values.location?.label || 'Last seen location set'} · {prettyDate(lastSeenAt)}
              </div>
              {values.location && (
                <div className="mt-4">
                  <MapView center={values.location} radiusKm={values.alertRadiusKm} />
                  <p className="mt-2 text-xs text-ink-muted">
                    Neighbours within {values.alertRadiusKm} km will be alerted.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {publishError && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10">
              {publishError}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setStep('form')} disabled={publishing}>
              Edit
            </Button>
            <Button fullWidth onClick={handleSubmit(publish)} loading={publishing}>
              Publish beacon
            </Button>
          </div>
        </motion.div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Report missing pet" back>
      <form onSubmit={handleSubmit(goPreview)} className="space-y-6 pb-4">
        <div>
          <FieldLabel required>Photo</FieldLabel>
          <Controller
            control={control}
            name="photoUrl"
            render={({ field }) => <PhotoUpload value={field.value} onChange={field.onChange} />}
          />
          <FieldError>{errors.photoUrl?.message as string}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="name" required>
            Pet name
          </FieldLabel>
          <Input id="name" placeholder="e.g. Biscuit" {...register('name')} />
          <FieldError>{errors.name?.message}</FieldError>
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
            <FieldLabel htmlFor="breed">Breed</FieldLabel>
            <Input id="breed" placeholder="e.g. Retriever" {...register('breed')} />
          </div>
          <div>
            <FieldLabel htmlFor="colour" required>
              Colour
            </FieldLabel>
            <Input id="colour" placeholder="e.g. Golden" {...register('colour')} />
            <FieldError>{errors.colour?.message}</FieldError>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="age">Age</FieldLabel>
            <Input id="age" placeholder="e.g. 3 years" {...register('age')} />
          </div>
          <div>
            <FieldLabel required>Size</FieldLabel>
            <Controller
              control={control}
              name="size"
              render={({ field }) => <SizePicker value={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            placeholder="Temperament, collar, distinctive marks, anything that helps…"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="lastSeenDate" required>
              Last seen date
            </FieldLabel>
            <Input id="lastSeenDate" type="date" max={todayISO()} {...register('lastSeenDate')} />
            <FieldError>{errors.lastSeenDate?.message}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="lastSeenTime" required>
              Time
            </FieldLabel>
            <Input id="lastSeenTime" type="time" {...register('lastSeenTime')} />
            <FieldError>{errors.lastSeenTime?.message}</FieldError>
          </div>
        </div>

        <div>
          <FieldLabel required>Last seen location</FieldLabel>
          <Controller
            control={control}
            name="location"
            render={({ field }) => <LocationPicker value={field.value} onChange={field.onChange} />}
          />
          <FieldError>{errors.location?.message as string}</FieldError>
        </div>

        <div>
          <FieldLabel hint="How far to alert neighbours">Alert radius</FieldLabel>
          <Controller
            control={control}
            name="alertRadiusKm"
            render={({ field }) => <RadiusPicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div>
          <FieldLabel>How should neighbours reach you?</FieldLabel>
          <Controller
            control={control}
            name="contactPref"
            render={({ field }) => <ContactPrefPicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        {values.contactPref !== 'in_app' && (
          <div>
            <FieldLabel htmlFor="contactValue" required>
              {values.contactPref === 'phone' ? 'Phone number to share' : 'Email to share'}
            </FieldLabel>
            <Input
              id="contactValue"
              type={values.contactPref === 'phone' ? 'tel' : 'email'}
              inputMode={values.contactPref === 'phone' ? 'tel' : 'email'}
              placeholder={values.contactPref === 'phone' ? 'e.g. 072 123 4567' : 'e.g. you@example.com'}
              {...register('contactValue')}
            />
            <FieldError>{errors.contactValue?.message}</FieldError>
          </div>
        )}

        <ConsentCheckbox registration={register('consent')} error={errors.consent?.message} />

        <Button type="submit" fullWidth size="lg">
          Preview beacon
        </Button>
      </form>
    </AppShell>
  );
}

export default function ReportMissingPage() {
  return (
    <Guard>
      <MissingForm />
    </Guard>
  );
}
