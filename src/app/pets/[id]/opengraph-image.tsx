import { ImageResponse } from 'next/og';

// Per-pet social share image (1200x630). Uses the pet's photo when there is
// one, otherwise a warm on-brand card - so every shared link previews nicely.
export const runtime = 'edge';
export const alt = 'A pet on Beacon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BRAND = '#f97316';
const TEAL = '#0d9488';

export default async function Image({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let pet:
    | {
        name: string | null;
        kind: string;
        species: string;
        breed: string | null;
        colour: string | null;
        location_label: string | null;
        photo_url: string | null;
      }
    | null = null;

  if (base && key) {
    try {
      const res = await fetch(
        `${base}/rest/v1/pet_reports?id=eq.${params.id}&select=name,kind,species,breed,colour,location_label,photo_url`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' },
      );
      const rows = await res.json();
      pet = Array.isArray(rows) ? rows[0] ?? null : null;
    } catch {
      pet = null;
    }
  }

  const isFound = pet?.kind === 'found';
  const name = pet?.name ?? (isFound ? 'Found pet' : 'A lost pet');
  const status = isFound ? 'FOUND' : 'MISSING';
  const statusColor = isFound ? TEAL : BRAND;
  const details = [pet?.breed, pet?.colour, pet?.location_label].filter(Boolean).join('  ·  ');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          background: pet?.photo_url
            ? '#0c0a09'
            : `linear-gradient(135deg, ${BRAND} 0%, #fb923c 55%, #fbbf24 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        {pet?.photo_url ? (
          <img
            src={pet.photo_url}
            alt=""
            width={1200}
            height={630}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}

        {/* Bottom scrim + text */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: '56px 64px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              background: statusColor,
              color: 'white',
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 2,
              padding: '8px 22px',
              borderRadius: 999,
            }}
          >
            {status}
          </div>
          <div style={{ color: 'white', fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
          {details ? (
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 34 }}>{details}</div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 46,
                height: 46,
                borderRadius: 12,
                background: 'white',
                color: statusColor,
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              B
            </div>
            <div style={{ color: 'white', fontSize: 30, fontWeight: 700 }}>Beacon</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 26 }}>
              · Helping neighbours bring pets home
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
