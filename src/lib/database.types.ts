// Beacon - Supabase generated-style types.
// Kept in sync with supabase/migrations. Regenerate with:
//   supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PetSpecies = 'dog' | 'cat' | 'other';
export type PetSize = 'small' | 'medium' | 'large';
export type ReportKind = 'missing' | 'found';
export type ReportStatus = 'active' | 'reunited' | 'resolved' | 'archived';
export type ContactPref = 'in_app' | 'phone' | 'email';
export type AlertSpeciesFilter = 'dogs' | 'cats' | 'all';
export type MatchStatus = 'suggested' | 'confirmed' | 'dismissed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_admin?: boolean;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      pet_reports: {
        Row: {
          id: string;
          reporter_id: string;
          kind: ReportKind;
          status: ReportStatus;
          name: string | null;
          species: PetSpecies;
          breed: string | null;
          colour: string | null;
          age: string | null;
          size: PetSize | null;
          description: string | null;
          photo_url: string | null;
          last_seen_at: string | null;
          last_seen_lat: number | null;
          last_seen_lng: number | null;
          location_label: string | null;
          alert_radius_km: number | null;
          still_has_pet: boolean | null;
          notes: string | null;
          contact_pref: ContactPref;
          contact_value: string | null;
          contact_consent: boolean;
          created_at: string;
          updated_at: string;
          reunited_at: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['pet_reports']['Row'],
          'id' | 'created_at' | 'updated_at' | 'status' | 'reunited_at' | 'contact_value' | 'contact_consent'
        > & { id?: string; status?: ReportStatus; contact_value?: string | null; contact_consent?: boolean };
        Update: Partial<Database['public']['Tables']['pet_reports']['Row']>;
        Relationships: [];
      };
      sightings: {
        Row: {
          id: string;
          report_id: string;
          reporter_id: string | null;
          seen_at: string;
          lat: number | null;
          lng: number | null;
          location_label: string | null;
          photo_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['sightings']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['sightings']['Row']>;
        Relationships: [];
      };
      alert_areas: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          lat: number;
          lng: number;
          radius_km: number;
          species_filter: AlertSpeciesFilter;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['alert_areas']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['alert_areas']['Row']>;
        Relationships: [];
      };
      notification_prefs: {
        Row: {
          user_id: string;
          alerts_enabled: boolean;
          push_token: string | null;
          default_radius_km: number;
          species_filter: AlertSpeciesFilter;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          alerts_enabled?: boolean;
          push_token?: string | null;
          default_radius_km?: number;
          species_filter?: AlertSpeciesFilter;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notification_prefs']['Row']>;
        Relationships: [];
      };
      flags: {
        Row: {
          id: string;
          report_id: string;
          reporter_id: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          reporter_id?: string | null;
          reason?: string | null;
        };
        Update: Partial<Database['public']['Tables']['flags']['Row']>;
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          found_report_id: string;
          missing_report_id: string;
          score: number;
          status: MatchStatus;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'status'> & {
          id?: string;
          status?: MatchStatus;
        };
        Update: Partial<Database['public']['Tables']['matches']['Row']>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      distance_km: {
        Args: { lat1: number; lng1: number; lat2: number; lng2: number };
        Returns: number;
      };
    };
    Enums: {
      pet_species: PetSpecies;
      pet_size: PetSize;
      report_kind: ReportKind;
      report_status: ReportStatus;
      contact_pref: ContactPref;
      alert_species_filter: AlertSpeciesFilter;
      match_status: MatchStatus;
    };
  };
}
