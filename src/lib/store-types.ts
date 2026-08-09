// Beacon - shared input shapes for the store & data layer (no React imports, so
// both the client store and the Supabase repo can depend on it circularly-free).

import type { PetReport } from '@/lib/types';

export interface NewReportInput {
  kind: 'missing' | 'found';
  name?: string | null;
  species: PetReport['species'];
  breed?: string | null;
  colour?: string | null;
  age?: string | null;
  size?: PetReport['size'];
  description?: string | null;
  photoUrl?: string | null;
  lastSeenAt?: string | null;
  location?: PetReport['location'];
  alertRadiusKm?: number | null;
  stillHasPet?: boolean | null;
  notes?: string | null;
  contactPref: PetReport['contactPref'];
  contactValue?: string | null;
  contactConsent?: boolean;
}
