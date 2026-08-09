// Beacon - Supabase data access for live mode.
//
// Every function here assumes a configured, authenticated client. RLS lets any
// visitor read reports/sightings/profiles (that's the point of a community
// board) while restricting writes to the owning user. The store calls these and
// falls back to the in-memory demo store when Supabase is not configured.

import type { Database } from '@/lib/database.types';
import { mapArea, mapReport } from '@/lib/mappers';
import type { AlertArea, NotificationPrefs, PetReport, Sighting } from '@/lib/types';
import type { NewReportInput } from '@/lib/store-types';
import type { getBrowserClient } from '@/lib/supabase/client';

// Exact client type produced by the app, so query builders infer table rows
// correctly (SupabaseClient<Database> with defaults does not line up).
type Client = NonNullable<ReturnType<typeof getBrowserClient>>;
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/** Load the full community feed (all reports, their reporters and sightings). */
export async function fetchReports(client: Client): Promise<PetReport[]> {
  const [{ data: reports }, { data: sightings }, { data: profiles }] = await Promise.all([
    client.from('pet_reports').select('*').order('created_at', { ascending: false }),
    client.from('sightings').select('*').order('seen_at', { ascending: false }),
    client.from('profiles').select('*'),
  ]);
  if (!reports) return [];

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const sightingsByReport = new Map<string, typeof sightings>();
  for (const s of sightings ?? []) {
    const list = sightingsByReport.get(s.report_id) ?? [];
    list.push(s);
    sightingsByReport.set(s.report_id, list);
  }

  return reports.map((r) =>
    mapReport(r, profileById.get(r.reporter_id) ?? null, sightingsByReport.get(r.id) ?? []),
  );
}

export async function fetchAreas(client: Client, userId: string): Promise<AlertArea[]> {
  const { data } = await client
    .from('alert_areas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return (data ?? []).map(mapArea);
}

export async function fetchPrefs(
  client: Client,
  userId: string,
): Promise<NotificationPrefs | null> {
  const { data } = await client
    .from('notification_prefs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return null;
  return {
    userId: data.user_id,
    alertsEnabled: data.alerts_enabled,
    pushToken: data.push_token,
    defaultRadiusKm: Number(data.default_radius_km),
    speciesFilter: data.species_filter,
  };
}

export async function fetchProfile(client: Client, userId: string): Promise<ProfileRow | null> {
  const { data } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data ?? null;
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const [meta, b64] = dataUrl.split(',');
  const mime = /data:(.*?);/.exec(meta)?.[1] ?? 'image/jpeg';
  const ext = (mime.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  return { blob: new Blob([arr], { type: mime }), ext };
}

/** Upload a data-URL photo into the caller's storage folder, return public URL. */
export async function uploadPhoto(
  client: Client,
  userId: string,
  dataUrl: string,
): Promise<string> {
  const { blob, ext } = dataUrlToBlob(dataUrl);
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage
    .from('pet-photos')
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw error;
  return client.storage.from('pet-photos').getPublicUrl(path).data.publicUrl;
}

/** If the photo is a freshly-picked data URL, push it to storage first. */
async function resolvePhoto(
  client: Client,
  userId: string,
  photoUrl?: string | null,
): Promise<string | null> {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('data:')) return uploadPhoto(client, userId, photoUrl);
  return photoUrl;
}

export async function insertReport(
  client: Client,
  reporter: ProfileRow,
  input: NewReportInput,
): Promise<PetReport> {
  const photo_url = await resolvePhoto(client, reporter.id, input.photoUrl);
  const { data, error } = await client
    .from('pet_reports')
    .insert({
      reporter_id: reporter.id,
      kind: input.kind,
      name: input.name ?? null,
      species: input.species,
      breed: input.breed ?? null,
      colour: input.colour ?? null,
      age: input.age ?? null,
      size: input.size ?? null,
      description: input.description ?? null,
      photo_url,
      last_seen_at: input.lastSeenAt ?? new Date().toISOString(),
      last_seen_lat: input.location?.lat ?? null,
      last_seen_lng: input.location?.lng ?? null,
      location_label: input.location?.label ?? null,
      alert_radius_km: input.alertRadiusKm ?? 3,
      still_has_pet: input.stillHasPet ?? null,
      notes: input.notes ?? null,
      contact_pref: input.contactPref,
      contact_value: input.contactValue ?? null,
      contact_consent: input.contactConsent ?? false,
    })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Could not create report');
  return mapReport(data, reporter, []);
}

export async function insertSighting(
  client: Client,
  reportId: string,
  userId: string,
  s: { seenAt: string; location?: { lat: number; lng: number; label?: string } | null; photoUrl?: string | null; notes?: string | null },
): Promise<Sighting> {
  const photo_url = await resolvePhoto(client, userId, s.photoUrl);
  const { data, error } = await client
    .from('sightings')
    .insert({
      report_id: reportId,
      reporter_id: userId,
      seen_at: s.seenAt,
      lat: s.location?.lat ?? null,
      lng: s.location?.lng ?? null,
      location_label: s.location?.label ?? null,
      photo_url,
      notes: s.notes ?? null,
    })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Could not send sighting');
  return {
    id: data.id,
    reportId: data.report_id,
    seenAt: data.seen_at,
    location: data.lat != null && data.lng != null
      ? { lat: data.lat, lng: data.lng, label: data.location_label ?? undefined }
      : null,
    photoUrl: data.photo_url,
    notes: data.notes,
    createdAt: data.created_at,
  };
}

export async function updateReport(
  client: Client,
  userId: string,
  id: string,
  input: Partial<NewReportInput>,
): Promise<PetReport> {
  const patch: Database['public']['Tables']['pet_reports']['Update'] = {};
  if (input.name !== undefined) patch.name = input.name ?? null;
  if (input.species !== undefined) patch.species = input.species;
  if (input.breed !== undefined) patch.breed = input.breed ?? null;
  if (input.colour !== undefined) patch.colour = input.colour ?? null;
  if (input.age !== undefined) patch.age = input.age ?? null;
  if (input.size !== undefined) patch.size = input.size ?? null;
  if (input.description !== undefined) patch.description = input.description ?? null;
  if (input.notes !== undefined) patch.notes = input.notes ?? null;
  if (input.stillHasPet !== undefined) patch.still_has_pet = input.stillHasPet ?? null;
  if (input.contactPref !== undefined) patch.contact_pref = input.contactPref;
  if (input.contactValue !== undefined) patch.contact_value = input.contactValue ?? null;
  if (input.alertRadiusKm !== undefined) patch.alert_radius_km = input.alertRadiusKm ?? null;
  if (input.lastSeenAt !== undefined) patch.last_seen_at = input.lastSeenAt ?? null;
  if (input.location !== undefined) {
    patch.last_seen_lat = input.location?.lat ?? null;
    patch.last_seen_lng = input.location?.lng ?? null;
    patch.location_label = input.location?.label ?? null;
  }
  if (input.photoUrl !== undefined) {
    patch.photo_url = await resolvePhoto(client, userId, input.photoUrl);
  }

  const { data, error } = await client
    .from('pet_reports')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Could not update report');
  return mapReport(data, null, []);
}

export async function setReportStatus(
  client: Client,
  reportId: string,
  status: PetReport['status'],
): Promise<void> {
  const patch: Database['public']['Tables']['pet_reports']['Update'] = { status };
  if (status === 'reunited') patch.reunited_at = new Date().toISOString();
  const { error } = await client.from('pet_reports').update(patch).eq('id', reportId);
  if (error) throw error;
}

export async function insertArea(
  client: Client,
  userId: string,
  area: Omit<AlertArea, 'id' | 'userId' | 'createdAt'>,
): Promise<AlertArea> {
  const { data, error } = await client
    .from('alert_areas')
    .insert({
      user_id: userId,
      label: area.label,
      lat: area.lat,
      lng: area.lng,
      radius_km: area.radiusKm,
      species_filter: area.speciesFilter,
      is_active: area.isActive,
    })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Could not add area');
  return mapArea(data);
}

export async function updateAreaRow(
  client: Client,
  id: string,
  patch: Partial<AlertArea>,
): Promise<void> {
  const { error } = await client
    .from('alert_areas')
    .update({
      label: patch.label,
      lat: patch.lat,
      lng: patch.lng,
      radius_km: patch.radiusKm,
      species_filter: patch.speciesFilter,
      is_active: patch.isActive,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAreaRow(client: Client, id: string): Promise<void> {
  const { error } = await client.from('alert_areas').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertPrefs(
  client: Client,
  userId: string,
  patch: Partial<NotificationPrefs>,
): Promise<void> {
  const { error } = await client.from('notification_prefs').upsert({
    user_id: userId,
    ...(patch.alertsEnabled != null ? { alerts_enabled: patch.alertsEnabled } : {}),
    ...(patch.defaultRadiusKm != null ? { default_radius_km: patch.defaultRadiusKm } : {}),
    ...(patch.speciesFilter != null ? { species_filter: patch.speciesFilter } : {}),
    ...(patch.pushToken !== undefined ? { push_token: patch.pushToken } : {}),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Delete a report (owner or admin, enforced by RLS). Cascades to sightings. */
export async function deleteReport(client: Client, id: string): Promise<void> {
  const { error } = await client.from('pet_reports').delete().eq('id', id);
  if (error) throw error;
}

/** Delete a single sighting (owner or admin, enforced by RLS). */
export async function deleteSighting(client: Client, id: string): Promise<void> {
  const { error } = await client.from('sightings').delete().eq('id', id);
  if (error) throw error;
}

/** Flag a report for moderation (any signed-in user). */
export async function insertFlag(
  client: Client,
  reportId: string,
  userId: string,
  reason: string,
): Promise<void> {
  const { error } = await client
    .from('flags')
    .insert({ report_id: reportId, reporter_id: userId, reason });
  if (error) throw error;
}

/** Load all flags (admin only, enforced by RLS). */
export async function fetchFlags(client: Client): Promise<
  { id: string; reportId: string; reason: string | null; createdAt: string }[]
> {
  const { data } = await client
    .from('flags')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []).map((f) => ({
    id: f.id,
    reportId: f.report_id,
    reason: f.reason,
    createdAt: f.created_at,
  }));
}

/** Dismiss (delete) a flag (admin only, enforced by RLS). */
export async function deleteFlag(client: Client, id: string): Promise<void> {
  const { error } = await client.from('flags').delete().eq('id', id);
  if (error) throw error;
}

/** Record a smart-match suggestion so the owner sees it. Best-effort. */
export async function insertMatch(
  client: Client,
  foundReportId: string,
  missingReportId: string,
  score: number,
): Promise<void> {
  await client
    .from('matches')
    .upsert(
      { found_report_id: foundReportId, missing_report_id: missingReportId, score },
      { onConflict: 'found_report_id,missing_report_id', ignoreDuplicates: true },
    );
}
