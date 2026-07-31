import { cn } from '@/lib/cn';
import type { GeoPoint } from '@/lib/types';

/**
 * Stylised neighbourhood map. Plots the primary location and any sightings on
 * an original SVG backdrop. Designed to be swapped for a live tile provider
 * (MapTiler / Mapbox) via NEXT_PUBLIC_MAP_TILE_KEY without changing callers.
 */
export function MapView({
  center,
  sightings = [],
  radiusKm,
  className,
}: {
  center: GeoPoint;
  sightings?: GeoPoint[];
  radiusKm?: number | null;
  className?: string;
}) {
  const W = 360;
  const H = 220;
  // Project nearby points relative to the centre. ~0.01 deg ≈ 1.1km; scale to px.
  const scale = 3600; // px per degree — keeps local sightings on-canvas
  const project = (p: GeoPoint) => ({
    x: Math.max(24, Math.min(W - 24, W / 2 + (p.lng - center.lng) * scale)),
    y: Math.max(24, Math.min(H - 24, H / 2 - (p.lat - center.lat) * scale)),
  });
  const c = { x: W / 2, y: H / 2 };
  const ringR = radiusKm ? Math.min(90, 20 + radiusKm * 12) : 0;

  return (
    <div className={cn('overflow-hidden rounded-3xl border border-white/60 dark:border-stone-800', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Map of ${center.label ?? 'location'}`}>
        <defs>
          <linearGradient id="mv-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ecfdf5" />
            <stop offset="100%" stopColor="#d1fae5" />
          </linearGradient>
          <linearGradient id="mv-bg-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f2a25" />
            <stop offset="100%" stopColor="#14231f" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} className="fill-[url(#mv-bg)] dark:fill-[url(#mv-bg-dark)]" />
        {/* water */}
        <path d={`M0 140c60 20 100-10 160 6s120 30 200 8v${H}H0Z`} fill="#a7f3d0" opacity="0.5" />
        {/* roads */}
        <g stroke="#ffffff" strokeWidth="7" opacity="0.85" strokeLinecap="round" className="dark:opacity-20">
          <path d="M30 20 130 220" />
          <path d="M0 90 360 66" />
          <path d="M250 0 300 220" />
        </g>
        <g stroke="#fcd34d" strokeWidth="2.5" opacity="0.8" strokeLinecap="round">
          <path d="M30 20 130 220" />
          <path d="M0 90 360 66" />
        </g>
        {/* parks */}
        <circle cx="72" cy="150" r="22" fill="#86efac" opacity="0.6" />
        <rect x="276" y="140" width="52" height="44" rx="10" fill="#86efac" opacity="0.6" />

        {/* radius ring */}
        {ringR > 0 && (
          <>
            <circle cx={c.x} cy={c.y} r={ringR} fill="#f97316" opacity="0.08" />
            <circle cx={c.x} cy={c.y} r={ringR} stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.5" fill="none" />
          </>
        )}

        {/* sightings */}
        {sightings.map((s, i) => {
          const p = project(s);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="9" fill="#14b8a6" opacity="0.25" />
              <circle cx={p.x} cy={p.y} r="4.5" fill="#0d9488" stroke="#fff" strokeWidth="1.5" />
            </g>
          );
        })}

        {/* main pin */}
        <g transform={`translate(${c.x - 12} ${c.y - 30})`}>
          <ellipse cx="12" cy="32" rx="9" ry="3" fill="#000" opacity="0.18" />
          <path d="M12 0C5 0 0 5.4 0 12.4 0 21 12 32 12 32s12-11 12-19.6C24 5.4 19 0 12 0Z" fill="#f97316" />
          <circle cx="12" cy="12" r="5" fill="#fff7ed" />
        </g>
      </svg>
    </div>
  );
}
