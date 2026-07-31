'use client';

import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/config';
import type { Database } from '@/lib/database.types';

/**
 * Browser Supabase client. Returns null in demo mode so callers fall back to
 * the in-memory store.
 */
export function getBrowserClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
