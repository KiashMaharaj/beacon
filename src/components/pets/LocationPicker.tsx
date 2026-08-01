'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { appConfig } from '@/lib/config';
import type { GeoPoint } from '@/lib/types';
import { searchPlaces, reverseGeocode, type GeoResult } from '@/lib/geocode';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { MapPinIcon, SearchIcon } from '@/components/ui/icons';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-56 w-full animate-pulse bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-[#0f2a25] dark:to-[#14231f]" />
  ),
});

/**
 * Location picker with real geocoding. Type an address to search, tap or drag
 * the pin to fine-tune, or use the device's location. Emits a GeoPoint whose
 * label is filled from reverse geocoding when the user hasn't typed one.
 */
export function LocationPicker({
  value,
  onChange,
}: {
  value: GeoPoint | null | undefined;
  onChange: (p: GeoPoint) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const labelEdited = useRef(false);

  const center = value ?? { ...appConfig.defaultCenter, label: '' };

  // Debounced forward-geocode as the user types.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const found = await searchPlaces(q, ctrl.signal);
      setResults(found);
      setOpen(found.length > 0);
      setSearching(false);
    }, 400);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query]);

  // Close the results dropdown on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (r: GeoResult) => {
    labelEdited.current = true;
    onChange({ lat: r.lat, lng: r.lng, label: r.label });
    setQuery(r.label);
    setResults([]);
    setOpen(false);
  };

  // When the pin moves (tap/drag/geolocation) fill the label if the user
  // hasn't typed their own, so the report always carries a readable place.
  const placePin = async (lat: number, lng: number, fallback?: string) => {
    onChange({ lat, lng, label: labelEdited.current ? value?.label ?? fallback ?? '' : fallback ?? '' });
    if (!labelEdited.current) {
      const name = await reverseGeocode(lat, lng);
      if (name) onChange({ lat, lng, label: name });
    }
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await placePin(pos.coords.latitude, pos.coords.longitude, 'My current location');
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div ref={boxRef} className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            labelEdited.current = true;
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a street, park or place…"
          className="pl-11"
          aria-label="Search for a location"
          autoComplete="off"
        />
        {searching && (
          <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-beacon-300 border-t-beacon-500" />
        )}
        {open && results.length > 0 && (
          <ul className="absolute z-[1000] mt-1.5 max-h-64 w-full overflow-auto rounded-2xl border border-stone-200 bg-white p-1.5 shadow-float dark:border-stone-700 dark:bg-stone-900">
            {results.map((r, i) => (
              <li key={`${r.lat}-${r.lng}-${i}`}>
                <button
                  type="button"
                  onClick={() => choose(r)}
                  className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-beacon-50 dark:hover:bg-stone-800"
                >
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-beacon-500" />
                  <span className="text-sm text-ink-soft dark:text-stone-300">{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Interactive map */}
      <div className="h-56 overflow-hidden rounded-3xl border border-white/60 dark:border-stone-800">
        <LeafletMap
          center={{ lat: center.lat, lng: center.lng }}
          marker={value ? { lat: value.lat, lng: value.lng } : null}
          markerDraggable
          interactive
          onPick={(p) => placePin(p.lat, p.lng)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation} loading={locating}>
          <MapPinIcon className="h-4 w-4" />
          Use my location
        </Button>
        <span className="text-xs text-ink-muted">or tap the map to drop a pin</span>
      </div>

      {value?.label && (
        <p className="flex items-center gap-1.5 rounded-2xl bg-beacon-50 px-3.5 py-2.5 text-sm text-ink-soft dark:bg-beacon-500/10 dark:text-stone-300">
          <MapPinIcon className="h-4 w-4 shrink-0 text-beacon-500" />
          {value.label}
        </p>
      )}
    </div>
  );
}
