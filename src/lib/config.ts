// Beacon - runtime configuration & feature detection.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Accept both the classic `ANON_KEY` name and Supabase's newer
// `PUBLISHABLE_KEY` name (its dashboard "Connect" snippet uses the latter), so
// either copied verbatim just works.
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  '';

/**
 * When Supabase credentials are absent the app runs in "demo mode" against a
 * seeded in-memory store. This lets the entire journey be explored with zero
 * backend configuration - invaluable for local development and reviews.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const appConfig = {
  name: 'Beacon',
  tagline: 'Helping neighbours bring pets home.',
  // Default map centre when the viewer has not shared a location (central London).
  defaultCenter: { lat: 51.5074, lng: -0.1278 },
  radiusOptions: [1, 3, 5, 10] as const,
} as const;
