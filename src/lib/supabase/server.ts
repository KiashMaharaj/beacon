import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/config';
import type { Database } from '@/lib/database.types';

/**
 * Server Supabase client (RSC / route handlers). Returns null in demo mode.
 * Typed as supabase-js's SupabaseClient so table rows infer correctly (the ssr
 * package bundles postgrest types that otherwise resolve rows to `never`).
 */
export function getServerClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;

  const cookieStore = cookies();
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component - safe to ignore; middleware refreshes.
        }
      },
    },
  }) as unknown as SupabaseClient<Database>;
}
