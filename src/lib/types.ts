// Beacon - application-facing domain types (camelCase view models).

export type Species = 'dog' | 'cat' | 'other';
export type Size = 'small' | 'medium' | 'large';
export type ReportKind = 'missing' | 'found';
export type ReportStatus = 'active' | 'reunited' | 'resolved' | 'archived';
export type ContactPref = 'in_app' | 'phone' | 'email';
export type SpeciesFilter = 'dogs' | 'cats' | 'all';

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface Reporter {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface Sighting {
  id: string;
  reportId: string;
  reporter?: Reporter | null;
  seenAt: string;
  location?: GeoPoint | null;
  photoUrl?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface PetReport {
  id: string;
  reporterId: string;
  reporter?: Reporter | null;
  kind: ReportKind;
  status: ReportStatus;
  name?: string | null;
  species: Species;
  breed?: string | null;
  colour?: string | null;
  age?: string | null;
  size?: Size | null;
  description?: string | null;
  photoUrl?: string | null;
  lastSeenAt?: string | null;
  location?: GeoPoint | null;
  alertRadiusKm?: number | null;
  stillHasPet?: boolean | null;
  notes?: string | null;
  contactPref: ContactPref;
  createdAt: string;
  updatedAt: string;
  reunitedAt?: string | null;
  sightings?: Sighting[];
  // Distance from the current viewer, in km, when a viewer location is known.
  distanceKm?: number | null;
}

export interface AlertArea {
  id: string;
  userId: string;
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
  speciesFilter: SpeciesFilter;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationPrefs {
  userId: string;
  alertsEnabled: boolean;
  pushToken?: string | null;
  defaultRadiusKm: number;
  speciesFilter: SpeciesFilter;
}

export interface MatchSuggestion {
  id: string;
  foundReportId: string;
  missingReport: PetReport;
  score: number;
  reasons: string[];
}
