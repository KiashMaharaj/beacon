'use client';

// Beacon - real interactive map built on Leaflet + OpenStreetMap.
//
// This module is client-only and must be loaded via next/dynamic with
// { ssr: false } (Leaflet touches `window` at import time). Callers use the
// MapView / LocationPicker wrappers rather than importing this directly.

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';

export interface LatLng {
  lat: number;
  lng: number;
}

// Carto basemaps: no API key, tasteful, and they ship a genuine dark style so
// the map looks native in dark mode. OSM standard is the keyless fallback.
const LIGHT_TILES =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const DARK_TILES =
  process.env.NEXT_PUBLIC_MAP_TILE_URL_DARK ??
  'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** On-brand teardrop pin as an inline-SVG divIcon (avoids Leaflet asset paths). */
function pin(color: string, dot = '#fff7ed') {
  return L.divIcon({
    className: 'beacon-pin',
    html: `<svg width="30" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="30" rx="7" ry="2.4" fill="#000" opacity="0.18"/>
      <path d="M12 0C5 0 0 5.4 0 12.4 0 21 12 32 12 32s12-11 12-19.6C24 5.4 19 0 12 0Z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="${dot}"/>
    </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
}

const primaryIcon = pin('#f97316');
const sightingIcon = pin('#0d9488');

/** Keeps the Leaflet view centred when the controlled center prop changes. */
function Recenter({ center, zoom }: { center: LatLng; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom ?? map.getZoom(), { animate: true });
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

/** Fixes sizing when the map mounts inside an animated / initially-hidden box. */
function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 60);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function ClickToPlace({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains('dark'));
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export interface LeafletMapProps {
  center: LatLng;
  zoom?: number;
  marker?: LatLng | null;
  markerDraggable?: boolean;
  sightings?: LatLng[];
  radiusKm?: number | null;
  interactive?: boolean;
  onPick?: (p: LatLng) => void;
}

export default function LeafletMap({
  center,
  zoom = 14,
  marker,
  markerDraggable = false,
  sightings = [],
  radiusKm,
  interactive = false,
  onPick,
}: LeafletMapProps) {
  const dark = useIsDark();
  const shown = marker ?? (interactive ? null : center);

  const dragHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const ll = (e.target as L.Marker).getLatLng();
        onPick?.({ lat: ll.lat, lng: ll.lng });
      },
    }),
    [onPick],
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      dragging
      zoomControl={interactive}
      attributionControl
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={dark ? DARK_TILES : LIGHT_TILES} attribution={ATTRIBUTION} />
      <Recenter center={center} zoom={zoom} />
      <InvalidateOnMount />
      {interactive && onPick && <ClickToPlace onPick={onPick} />}

      {radiusKm != null && radiusKm > 0 && (
        <Circle
          center={[(shown ?? center).lat, (shown ?? center).lng]}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#f97316', weight: 1.5, fillColor: '#f97316', fillOpacity: 0.08 }}
        />
      )}

      {sightings.map((s, i) => (
        <Marker key={i} position={[s.lat, s.lng]} icon={sightingIcon} />
      ))}

      {shown && (
        <Marker
          position={[shown.lat, shown.lng]}
          icon={primaryIcon}
          draggable={markerDraggable}
          eventHandlers={markerDraggable ? dragHandlers : undefined}
        />
      )}
    </MapContainer>
  );
}
