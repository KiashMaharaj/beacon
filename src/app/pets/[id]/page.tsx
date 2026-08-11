import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getServerClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/config';
import { PetDetailClient } from './PetDetailClient';

// Per-pet Open Graph / Twitter metadata so a shared link renders a rich preview
// card (photo, name, details) in messages and social apps - which is what turns
// a share into a new visitor. Falls back gracefully in demo mode.
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = getServerClient();
  if (!supabase) return { title: 'Pet' };

  const { data } = await supabase
    .from('pet_reports')
    .select('name, kind, species, breed, colour, location_label, photo_url')
    .eq('id', params.id)
    .maybeSingle();

  if (!data) return { title: 'Pet not found' };

  const name = data.name ?? (data.kind === 'found' ? 'Found pet' : 'A lost pet');
  const details = [data.breed, data.colour, data.location_label].filter(Boolean).join(' · ');
  const title = data.kind === 'found' ? `Found: ${name}` : `Help find ${name}`;
  const description =
    (data.kind === 'found'
      ? `A ${data.species} was found and is looking for their family.`
      : `${name} is missing and their family needs your help.`) +
    (details ? ` ${details}.` : '') +
    ' Seen them? Help reunite this pet on Beacon.';
  // Build absolute URLs from the actual request host so the share card works no
  // matter which domain served the page (apex vs www vs preview) - a mismatch
  // here is what makes crawlers silently drop the preview image.
  const h = headers();
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https');
  const origin = host ? `${proto}://${host}` : siteUrl;
  const url = `${origin}/pets/${params.id}`;

  // The share image is rendered per-pet by opengraph-image.tsx in this folder.
  // We reference it explicitly (rather than relying on auto-wiring) with an
  // absolute, host-correct URL so every crawler picks it up reliably.
  const image = `${origin}/pets/${params.id}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      siteName: 'Beacon',
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default function PetDetailPage() {
  return <PetDetailClient />;
}
