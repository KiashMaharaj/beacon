'use client';

import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBeacon } from '@/lib/store';
import { areaSchema, type AreaForm } from '@/lib/schemas';
import type { AlertArea } from '@/lib/types';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FieldError, FieldLabel, Input } from '@/components/ui/Field';
import { RadiusPicker, SpeciesFilterPicker } from '@/components/pets/FormControls';
import { LocationPicker } from '@/components/pets/LocationPicker';
import { BellIcon, MapPinIcon, PlusIcon } from '@/components/ui/icons';

const areaPresets = ['Home', 'Work', 'Parents', 'Holiday home'];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-beacon-500' : 'bg-stone-300 dark:bg-stone-700'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

function speciesFilterLabel(f: string) {
  if (f === 'dogs') return 'Dogs only';
  if (f === 'cats') return 'Cats only';
  return 'All pets';
}

function AreaEditor({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: AlertArea | null;
}) {
  const { addArea, updateArea, removeArea } = useBeacon();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AreaForm>({
    resolver: zodResolver(areaSchema) as Resolver<AreaForm>,
    defaultValues: initial
      ? {
          label: initial.label,
          location: { lat: initial.lat, lng: initial.lng, label: initial.label },
          radiusKm: initial.radiusKm,
          speciesFilter: initial.speciesFilter,
        }
      : { label: '', radiusKm: 3, speciesFilter: 'all' },
  });

  const submit = (data: AreaForm) => {
    if (!data.location) return;
    if (initial) {
      updateArea(initial.id, {
        label: data.label,
        lat: data.location.lat,
        lng: data.location.lng,
        radiusKm: data.radiusKm,
        speciesFilter: data.speciesFilter,
      });
    } else {
      addArea({
        label: data.label,
        lat: data.location.lat,
        lng: data.location.lng,
        radiusKm: data.radiusKm,
        speciesFilter: data.speciesFilter,
        isActive: true,
      });
    }
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit area' : 'Add an area'}>
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <div>
          <FieldLabel required>Name</FieldLabel>
          <div className="mb-2 flex flex-wrap gap-2">
            {areaPresets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => reset((v) => ({ ...v, label: p }))}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-ink-soft transition hover:bg-beacon-100 dark:bg-stone-800 dark:text-stone-300"
              >
                {p}
              </button>
            ))}
          </div>
          <Input placeholder="e.g. Home" {...register('label')} />
          <FieldError>{errors.label?.message}</FieldError>
        </div>

        <div>
          <FieldLabel required>Location</FieldLabel>
          <Controller
            control={control}
            name="location"
            render={({ field }) => <LocationPicker value={field.value} onChange={field.onChange} />}
          />
          <FieldError>{errors.location?.message as string}</FieldError>
        </div>

        <div>
          <FieldLabel>Notify me within</FieldLabel>
          <Controller
            control={control}
            name="radiusKm"
            render={({ field }) => <RadiusPicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div>
          <FieldLabel>For which pets?</FieldLabel>
          <Controller
            control={control}
            name="speciesFilter"
            render={({ field }) => <SpeciesFilterPicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="flex gap-3 pt-2">
          {initial && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                removeArea(initial.id);
                onClose();
              }}
            >
              Delete
            </Button>
          )}
          <Button type="submit" fullWidth>
            {initial ? 'Save area' : 'Add area'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AlertsContent() {
  const { prefs, updatePrefs, enableAlerts, areas } = useBeacon();
  const [editing, setEditing] = useState<AlertArea | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <AppShell title="Alerts">
      {/* Master toggle */}
      <Card className="flex items-center gap-3 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-beacon-gradient text-white shadow-glow">
          <BellIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink dark:text-cream-50">Nearby pet alerts</p>
          <p className="text-xs text-ink-muted dark:text-stone-400">
            Get notified when a pet goes missing near a saved area.
          </p>
        </div>
        <Toggle
          checked={prefs.alertsEnabled}
          onChange={(v) => (v ? enableAlerts() : updatePrefs({ alertsEnabled: false }))}
          label="Toggle alerts"
        />
      </Card>

      <div className="mt-4 rounded-2xl bg-harbor-50 p-3.5 text-xs leading-relaxed text-harbor-800 dark:bg-harbor-500/10 dark:text-harbor-200">
        🔒 Beacon only checks whether a missing pet&apos;s last-seen spot overlaps one of your saved
        areas. It never tracks your location in the background.
      </div>

      {/* Saved areas */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink dark:text-cream-50">Saved areas</h2>
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <PlusIcon className="h-4 w-4" /> Add
          </Button>
        </div>

        {areas.length === 0 ? (
          <Card className="p-6 text-center">
            <MapPinIcon className="mx-auto h-8 w-8 text-beacon-300" />
            <p className="mt-2 text-sm font-semibold text-ink dark:text-cream-50">No areas yet</p>
            <p className="mt-1 text-xs text-ink-muted dark:text-stone-400">
              Add your home, work or family&apos;s place to watch those neighbourhoods.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {areas.map((area) => (
              <button
                key={area.id}
                onClick={() => setEditing(area)}
                className="flex w-full items-center gap-3 rounded-3xl border border-white/60 bg-white/80 p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:border-stone-800 dark:bg-stone-900/70"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-beacon-100 text-beacon-600 dark:bg-beacon-500/15">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink dark:text-cream-50">{area.label}</p>
                  <p className="text-xs text-ink-muted dark:text-stone-400">
                    Within {area.radiusKm} km · {speciesFilterLabel(area.speciesFilter)}
                  </p>
                </div>
                {area.isActive ? <Badge tone="success">On</Badge> : <Badge tone="neutral">Off</Badge>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Future expansion teaser */}
      <div className="mt-10">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
          Coming to Beacon
        </h2>
        <Card className="p-4">
          <p className="text-sm text-ink-soft dark:text-stone-300">
            Beacon is growing into your whole neighbourhood. Soon you&apos;ll be able to opt into
            community safety alerts, estate notices, local recommendations and more — all with the
            same privacy-first approach.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Safety alerts', 'Estate notices', 'Local services', 'Found items'].map((t) => (
              <span
                key={t}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-ink-muted dark:bg-stone-800 dark:text-stone-400"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <AreaEditor open={adding} onClose={() => setAdding(false)} />
      <AreaEditor open={!!editing} onClose={() => setEditing(null)} initial={editing} />
    </AppShell>
  );
}

export default function AlertsPage() {
  return (
    <Guard>
      <AlertsContent />
    </Guard>
  );
}
