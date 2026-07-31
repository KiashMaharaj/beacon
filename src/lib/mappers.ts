// Beacon — map Supabase rows <-> domain view models.

import type { Database } from './database.types';
import type { AlertArea, PetReport, Sighting } from './types';

type ReportRow = Database['public']['Tables']['pet_reports']['Row'];
type SightingRow = Database['public']['Tables']['sightings']['Row'];
type AreaRow = Database['public']['Tables']['alert_areas']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function mapReport(
  row: ReportRow,
  reporter?: ProfileRow | null,
  sightings?: SightingRow[],
): PetReport {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    reporter: reporter
      ? { id: reporter.id, name: reporter.full_name ?? 'A neighbour', avatarUrl: reporter.avatar_url }
      : null,
    kind: row.kind,
    status: row.status,
    name: row.name,
    species: row.species,
    breed: row.breed,
    colour: row.colour,
    age: row.age,
    size: row.size,
    description: row.description,
    photoUrl: row.photo_url,
    lastSeenAt: row.last_seen_at,
    location:
      row.last_seen_lat != null && row.last_seen_lng != null
        ? { lat: row.last_seen_lat, lng: row.last_seen_lng, label: row.location_label ?? undefined }
        : null,
    alertRadiusKm: row.alert_radius_km,
    stillHasPet: row.still_has_pet,
    notes: row.notes,
    contactPref: row.contact_pref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reunitedAt: row.reunited_at,
    sightings: sightings?.map(mapSighting),
  };
}

export function mapSighting(row: SightingRow): Sighting {
  return {
    id: row.id,
    reportId: row.report_id,
    seenAt: row.seen_at,
    location:
      row.lat != null && row.lng != null
        ? { lat: row.lat, lng: row.lng, label: row.location_label ?? undefined }
        : null,
    photoUrl: row.photo_url,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function mapArea(row: AreaRow): AlertArea {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    lat: row.lat,
    lng: row.lng,
    radiusKm: Number(row.radius_km),
    speciesFilter: row.species_filter,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}
