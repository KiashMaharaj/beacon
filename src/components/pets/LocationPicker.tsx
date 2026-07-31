'use client';

import { useRef, useState } from 'react';
import { appConfig } from '@/lib/config';
import type { GeoPoint } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { MapPinIcon } from '@/components/ui/icons';

/**
 * Tap-to-place location picker on a stylised map, with optional device
 * geolocation. Emits a GeoPoint (lat/lng + label).
 */
export function LocationPicker({
  value,
  onChange,
}: {
  value: GeoPoint | null | undefined;
  onChange: (p: GeoPoint) => void;
}) {
  const [locating, setLocating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const center = value ?? { ...appConfig.defaultCenter, label: '' };
  const W = 360;
  const H = 200;
  const scale = 3000;

  const point = value
    ? {
        x: Math.max(16, Math.min(W - 16, W / 2 + (value.lng - appConfig.defaultCenter.lng) * scale)),
        y: Math.max(16, Math.min(H - 16, H / 2 - (value.lat - appConfig.defaultCenter.lat) * scale)),
      }
    : { x: W / 2, y: H / 2 };

  const handleTap = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    const lng = appConfig.defaultCenter.lng + (x - W / 2) / scale;
    const lat = appConfig.defaultCenter.lat - (y - H / 2) / scale;
    onChange({ lat, lng, label: value?.label ?? '' });
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: value?.label ?? 'My current location',
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border border-white/60 dark:border-stone-800">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full cursor-crosshair touch-none"
          onClick={handleTap}
          role="img"
          aria-label="Tap the map to set the location"
        >
          <rect width={W} height={H} fill="#ecfdf5" className="dark:fill-[#0f2a25]" />
          <path d={`M0 130c60 18 100-10 160 6s120 26 200 6v${H}H0Z`} fill="#a7f3d0" opacity="0.5" />
          <g stroke="#ffffff" strokeWidth="7" opacity="0.85" strokeLinecap="round" className="dark:opacity-20">
            <path d="M30 20 130 200" />
            <path d="M0 84 360 60" />
            <path d="M250 0 300 200" />
          </g>
          <g stroke="#fcd34d" strokeWidth="2.5" opacity="0.8" strokeLinecap="round">
            <path d="M0 84 360 60" />
          </g>
          <circle cx="70" cy="140" r="20" fill="#86efac" opacity="0.6" />
          {value && (
            <g transform={`translate(${point.x - 12} ${point.y - 30})`} className="animate-scale-in">
              <ellipse cx="12" cy="32" rx="9" ry="3" fill="#000" opacity="0.18" />
              <path d="M12 0C5 0 0 5.4 0 12.4 0 21 12 32 12 32s12-11 12-19.6C24 5.4 19 0 12 0Z" fill="#f97316" />
              <circle cx="12" cy="12" r="5" fill="#fff7ed" />
            </g>
          )}
        </svg>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation} loading={locating}>
          <MapPinIcon className="h-4 w-4" />
          Use my location
        </Button>
        <span className="text-xs text-ink-muted">or tap the map</span>
      </div>

      <Input
        placeholder="Add a place name (e.g. Riverside Park)"
        value={value?.label ?? ''}
        onChange={(e) => onChange({ ...center, label: e.target.value })}
        aria-label="Location name"
      />
    </div>
  );
}
