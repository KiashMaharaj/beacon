'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBeacon } from '@/lib/store';
import type { GeoPoint, Size, Species, ContactPref } from '@/lib/types';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/Feedback';
import { FieldError, FieldLabel, Input, Textarea } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  ContactPrefPicker,
  RadiusPicker,
  SizePicker,
  SpeciesPicker,
} from '@/components/pets/FormControls';
import { LocationPicker } from '@/components/pets/LocationPicker';
import { PhotoUpload } from '@/components/pets/PhotoUpload';
import { PawPrint } from '@/components/illustrations/Pets';

function EditContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getReport, updateReport, user, isAdmin } = useBeacon();
  const report = getReport(params.id);

  const [photoUrl, setPhotoUrl] = useState<string | null>(report?.photoUrl ?? null);
  const [name, setName] = useState(report?.name ?? '');
  const [species, setSpecies] = useState<Species>(report?.species ?? 'dog');
  const [breed, setBreed] = useState(report?.breed ?? '');
  const [colour, setColour] = useState(report?.colour ?? '');
  const [age, setAge] = useState(report?.age ?? '');
  const [size, setSize] = useState<Size>(report?.size ?? 'medium');
  const [description, setDescription] = useState(report?.description ?? '');
  const [notes, setNotes] = useState(report?.notes ?? '');
  const [location, setLocation] = useState<GeoPoint | null>(report?.location ?? null);
  const [radius, setRadius] = useState(report?.alertRadiusKm ?? 3);
  const [stillHasPet, setStillHasPet] = useState(report?.stillHasPet ?? true);
  const [contactPref, setContactPref] = useState<ContactPref>(report?.contactPref ?? 'in_app');
  const [contactValue, setContactValue] = useState(report?.contactValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!report) {
    return (
      <AppShell title="Edit" back>
        <Card className="mt-6">
          <EmptyState
            illustration={<PawPrint className="h-16 w-16 text-beacon-300" />}
            title="This pet isn't here"
            description="The report may have been removed."
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

  const canEdit = report.reporterId === user.id || isAdmin;
  if (!canEdit) {
    router.replace(`/pets/${report.id}`);
    return null;
  }

  const isMissing = report.kind === 'missing';

  const save = async () => {
    setError(null);
    if (isMissing && !name.trim()) {
      setError('Please add your pet’s name.');
      return;
    }
    if (!colour.trim()) {
      setError('Please add a colour so neighbours can spot them.');
      return;
    }
    if (!location) {
      setError(isMissing ? 'Please set where they were last seen.' : 'Please set where you found them.');
      return;
    }
    if (contactPref !== 'in_app' && !contactValue.trim()) {
      setError(
        contactPref === 'phone'
          ? 'Add a phone number, or choose “Sightings only”.'
          : 'Add an email, or choose “Sightings only”.',
      );
      return;
    }
    setSaving(true);
    try {
      await updateReport(report.id, {
        species,
        breed: breed.trim() || null,
        colour: colour.trim(),
        size,
        photoUrl,
        location,
        contactPref,
        contactValue: contactPref !== 'in_app' ? contactValue.trim() : null,
        ...(isMissing
          ? {
              name: name.trim(),
              age: age.trim() || null,
              description: description.trim() || null,
              alertRadiusKm: radius,
            }
          : {
              notes: notes.trim() || null,
              stillHasPet,
            }),
      });
      router.replace(`/pets/${report.id}`);
    } catch {
      setSaving(false);
      setError('Sorry, we could not save your changes. Please try again.');
    }
  };

  return (
    <AppShell title="Edit report" back>
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-6 pb-4"
      >
        <div>
          <FieldLabel>Photo</FieldLabel>
          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
        </div>

        {isMissing && (
          <div>
            <FieldLabel htmlFor="name" required>
              Pet name
            </FieldLabel>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Biscuit" />
          </div>
        )}

        <div>
          <FieldLabel required>Species</FieldLabel>
          <SpeciesPicker value={species} onChange={setSpecies} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="breed">Breed</FieldLabel>
            <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="e.g. Retriever" />
          </div>
          <div>
            <FieldLabel htmlFor="colour" required>
              Colour
            </FieldLabel>
            <Input id="colour" value={colour} onChange={(e) => setColour(e.target.value)} placeholder="e.g. Golden" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {isMissing && (
            <div>
              <FieldLabel htmlFor="age">Age</FieldLabel>
              <Input id="age" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 3 years" />
            </div>
          )}
          <div>
            <FieldLabel required>Size</FieldLabel>
            <SizePicker value={size} onChange={setSize} />
          </div>
        </div>

        {isMissing ? (
          <div>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Temperament, collar, distinctive marks…"
            />
          </div>
        ) : (
          <>
            <div>
              <FieldLabel>Do you still have the pet?</FieldLabel>
              <SegmentedControl
                options={[
                  { value: 'yes', label: 'Yes, with me' },
                  { value: 'no', label: 'No, it ran off' },
                ]}
                value={stillHasPet ? 'yes' : 'no'}
                onChange={(v) => setStillHasPet(v === 'yes')}
              />
            </div>
            <div>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything helpful: collar, behaviour, where they are now…"
              />
            </div>
          </>
        )}

        <div>
          <FieldLabel required>{isMissing ? 'Last seen location' : 'Where you found them'}</FieldLabel>
          <LocationPicker value={location} onChange={setLocation} />
        </div>

        {isMissing && (
          <div>
            <FieldLabel hint="How far to alert neighbours">Alert radius</FieldLabel>
            <RadiusPicker value={radius} onChange={setRadius} />
          </div>
        )}

        <div>
          <FieldLabel>How should neighbours reach you?</FieldLabel>
          <ContactPrefPicker value={contactPref} onChange={setContactPref} />
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
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={contactPref === 'phone' ? 'e.g. 072 123 4567' : 'e.g. you@example.com'}
            />
          </div>
        )}

        {error && (
          <p className="rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Link href={`/pets/${report.id}`} className="flex-1">
            <Button type="button" variant="outline" fullWidth disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" fullWidth loading={saving}>
            Save changes
          </Button>
        </div>
      </motion.form>
    </AppShell>
  );
}

export default function EditReportPage() {
  return (
    <Guard>
      <EditContent />
    </Guard>
  );
}
