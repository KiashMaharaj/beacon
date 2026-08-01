'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/cn';
import type { GeoPoint } from '@/lib/types';

// Leaflet is client-only; load the real map without SSR and show a soft
// gradient placeholder while it hydrates.
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-[#0f2a25] dark:to-[#14231f]" />
  ),
});

/**
 * Read-only neighbourhood map. Plots the primary location, any sightings and an
 * optional alert-radius ring on real OpenStreetMap tiles.
 */
export function MapView({
  center,
  sightings = [],
  radiusKm,
  className,
  heightClass = 'h-52',
}: {
  center: GeoPoint;
  sightings?: GeoPoint[];
  radiusKm?: number | null;
  className?: string;
  heightClass?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border border-white/60 dark:border-stone-800',
        heightClass,
        className,
      )}
    >
      <LeafletMap
        center={{ lat: center.lat, lng: center.lng }}
        marker={{ lat: center.lat, lng: center.lng }}
        sightings={sightings.map((s) => ({ lat: s.lat, lng: s.lng }))}
        radiusKm={radiusKm}
        zoom={radiusKm && radiusKm >= 5 ? 12 : 14}
      />
    </div>
  );
}
