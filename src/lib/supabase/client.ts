'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/config';
import type { Database } from '@/lib/database.types';

/**
 * Browser Supabase client. Returns null in demo mode so callers fall back to
 * the in-memory store.
 *
 * The return type is pinned to `SupabaseClient<Database>` from
 * `@supabase/supabase-js`: `@supabase/ssr` re-exports a client whose bundled
 * postgrest types differ enough to break row inference, so we normalise it here.
 */
export function getBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey) as unknown as SupabaseClient<Database>;
}
