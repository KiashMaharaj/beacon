// Beacon - forward & reverse geocoding.
//
// Uses OpenStreetMap's Nominatim service by default, which needs no API key.
// The endpoint is overridable via NEXT_PUBLIC_GEOCODER_URL so a self-hosted or
// commercial geocoder can be dropped in for production scale without touching
// callers. Nominatim's usage policy asks for light, attributed use; the app
// debounces requests and caps results.

export interface GeoResult {
  lat: number;
  lng: number;
  label: string;
}

const BASE =
  process.env.NEXT_PUBLIC_GEOCODER_URL?.replace(/\/$/, '') ??
  'https://nominatim.openstreetmap.org';

/** Trim a verbose Nominatim display name to something friendly and compact. */
function tidyLabel(display: string): string {
  const parts = display.split(',').map((p) => p.trim());
  if (parts.length <= 3) return parts.join(', ');
  // Keep the most specific two parts plus the town/city.
  return [parts[0], parts[1], parts[parts.length - 3] ?? parts[2]]
    .filter(Boolean)
    .join(', ');
}

/** Forward geocode: turn a typed query into candidate places. */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<GeoResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL(`${BASE}/search`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '6');
  url.searchParams.set('addressdetails', '1');

  try {
    const res = await fetch(url.toString(), {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    return data.map((d) => ({
      lat: Number(d.lat),
      lng: Number(d.lon),
      label: tidyLabel(d.display_name),
    }));
  } catch {
    // Aborted or offline: fail quiet, the map still works by tap/drag.
    return [];
  }
}

/** Reverse geocode: turn a dropped pin into a readable place name. */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = new URL(`${BASE}/reverse`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('zoom', '16');

  try {
    const res = await fetch(url.toString(), {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ? tidyLabel(data.display_name) : null;
  } catch {
    return null;
  }
}
