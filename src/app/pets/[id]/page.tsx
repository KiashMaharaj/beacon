import type { Metadata } from 'next';
import { getServerClient } from '@/lib/supabase/server';
import { PetDetailClient } from './PetDetailClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beacon-six-chi.vercel.app';

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
  const url = `${siteUrl}/pets/${params.id}`;
  const images = [data.photo_url ?? `${siteUrl}/icon-512.png`];

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
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default function PetDetailPage() {
  return <PetDetailClient />;
}
