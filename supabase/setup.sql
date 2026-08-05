-- Beacon: complete database setup.
-- Paste this whole file into the Supabase SQL Editor and Run once.
-- It applies migrations 0001-0005 in order (schema, RLS, storage, match policy, cleanup).
-- Safe to re-run: every statement is idempotent (if not exists / drop-if-exists).


-- ====================================================================
-- 0001_init.sql
-- ====================================================================
-- Beacon - Initial schema
-- Version 1: Lost & Found Pets
-- Designed for future expansion into a broader neighbourhood platform.

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()
-- NB: we intentionally do NOT enable PostGIS. Radius queries use the plain-SQL
-- distance_km() haversine helper below, so we avoid PostGIS's spatial_ref_sys
-- table (which sits in the public schema without RLS and trips the linter).

-- Enums --------------------------------------------------------------------
do $$ begin
  create type pet_species as enum ('dog', 'cat', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pet_size as enum ('small', 'medium', 'large');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_kind as enum ('missing', 'found');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('active', 'reunited', 'resolved', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_pref as enum ('in_app', 'phone', 'email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_species_filter as enum ('dogs', 'cats', 'all');
exception when duplicate_object then null; end $$;

do $$ begin
  create type match_status as enum ('suggested', 'confirmed', 'dismissed');
exception when duplicate_object then null; end $$;

-- Profiles -----------------------------------------------------------------
-- Mirrors auth.users. One row per authenticated user.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  avatar_url   text,
  phone        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Pet reports (missing OR found) -------------------------------------------
create table if not exists public.pet_reports (
  id             uuid primary key default gen_random_uuid(),
  reporter_id    uuid not null references public.profiles(id) on delete cascade,
  kind           report_kind not null,
  status         report_status not null default 'active',

  -- Pet attributes
  name           text,                       -- null for found pets without known name
  species        pet_species not null,
  breed          text,
  colour         text,
  age            text,
  size           pet_size,
  description    text,
  photo_url      text,

  -- Location & timing of last seen / found
  last_seen_at   timestamptz,
  last_seen_lat  double precision,
  last_seen_lng  double precision,
  location_label text,
  alert_radius_km numeric(5,2) default 3,     -- missing pets only

  -- Found-pet specifics
  still_has_pet  boolean,                     -- found reports: is the finder still holding the pet
  notes          text,

  -- Contact
  contact_pref   contact_pref not null default 'in_app',

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  reunited_at    timestamptz
);

-- Sightings ("I saw this pet") ---------------------------------------------
create table if not exists public.sightings (
  id           uuid primary key default gen_random_uuid(),
  report_id    uuid not null references public.pet_reports(id) on delete cascade,
  reporter_id  uuid references public.profiles(id) on delete set null,
  seen_at      timestamptz not null default now(),
  lat          double precision,
  lng          double precision,
  location_label text,
  photo_url    text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- Saved alert areas --------------------------------------------------------
create table if not exists public.alert_areas (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  label        text not null,                 -- Home, Work, Parents, Holiday home, custom
  lat          double precision not null,
  lng          double precision not null,
  radius_km    numeric(5,2) not null default 3,
  species_filter alert_species_filter not null default 'all',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Notification preferences -------------------------------------------------
create table if not exists public.notification_prefs (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  alerts_enabled      boolean not null default false,
  push_token          text,                   -- FCM registration token
  default_radius_km   numeric(5,2) not null default 3,
  species_filter      alert_species_filter not null default 'all',
  updated_at          timestamptz not null default now()
);

-- Smart-match suggestions (found report <-> missing report) ----------------
create table if not exists public.matches (
  id               uuid primary key default gen_random_uuid(),
  found_report_id  uuid not null references public.pet_reports(id) on delete cascade,
  missing_report_id uuid not null references public.pet_reports(id) on delete cascade,
  score            numeric(5,2) not null,     -- 0..100 confidence
  status           match_status not null default 'suggested',
  created_at       timestamptz not null default now(),
  unique (found_report_id, missing_report_id)
);

-- Indexes ------------------------------------------------------------------
create index if not exists idx_reports_status_kind on public.pet_reports (status, kind);
create index if not exists idx_reports_species on public.pet_reports (species);
create index if not exists idx_reports_created on public.pet_reports (created_at desc);
create index if not exists idx_reports_reporter on public.pet_reports (reporter_id);
create index if not exists idx_reports_geo on public.pet_reports (last_seen_lat, last_seen_lng);
create index if not exists idx_sightings_report on public.sightings (report_id, seen_at desc);
create index if not exists idx_alert_areas_user on public.alert_areas (user_id);
create index if not exists idx_matches_missing on public.matches (missing_report_id);
create index if not exists idx_matches_found on public.matches (found_report_id);

-- updated_at trigger -------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_reports_touch on public.pet_reports;
create trigger trg_reports_touch before update on public.pet_reports
  for each row execute function public.touch_updated_at();

-- Auto-create profile on signup --------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.notification_prefs (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Haversine distance helper (km) - no PostGIS dependency required -----------
create or replace function public.distance_km(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision language sql immutable as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;


-- ====================================================================
-- 0002_rls.sql
-- ====================================================================
-- Beacon - Row Level Security policies
-- Principle: reports and sightings are community-visible (that's the point),
-- but only owners can mutate their own rows.

alter table public.profiles           enable row level security;
alter table public.pet_reports        enable row level security;
alter table public.sightings          enable row level security;
alter table public.alert_areas        enable row level security;
alter table public.notification_prefs enable row level security;
alter table public.matches            enable row level security;

-- Profiles -----------------------------------------------------------------
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Pet reports --------------------------------------------------------------
-- Anyone (even anonymous) can browse active reports; the whole neighbourhood benefits.
drop policy if exists "reports_select_all" on public.pet_reports;
create policy "reports_select_all" on public.pet_reports
  for select using (true);

drop policy if exists "reports_insert_own" on public.pet_reports;
create policy "reports_insert_own" on public.pet_reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists "reports_update_own" on public.pet_reports;
create policy "reports_update_own" on public.pet_reports
  for update using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);

drop policy if exists "reports_delete_own" on public.pet_reports;
create policy "reports_delete_own" on public.pet_reports
  for delete using (auth.uid() = reporter_id);

-- Sightings ----------------------------------------------------------------
drop policy if exists "sightings_select_all" on public.sightings;
create policy "sightings_select_all" on public.sightings
  for select using (true);

drop policy if exists "sightings_insert_auth" on public.sightings;
create policy "sightings_insert_auth" on public.sightings
  for insert with check (auth.uid() = reporter_id);

drop policy if exists "sightings_delete_own" on public.sightings;
create policy "sightings_delete_own" on public.sightings
  for delete using (auth.uid() = reporter_id);

-- Alert areas (private to the user) ----------------------------------------
drop policy if exists "areas_all_own" on public.alert_areas;
create policy "areas_all_own" on public.alert_areas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notification prefs (private) ---------------------------------------------
drop policy if exists "prefs_all_own" on public.notification_prefs;
create policy "prefs_all_own" on public.notification_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Matches: visible to either report owner; created by the app/service role.
drop policy if exists "matches_select_involved" on public.matches;
create policy "matches_select_involved" on public.matches
  for select using (
    exists (
      select 1 from public.pet_reports r
      where (r.id = found_report_id or r.id = missing_report_id)
        and r.reporter_id = auth.uid()
    )
  );

drop policy if exists "matches_update_involved" on public.matches;
create policy "matches_update_involved" on public.matches
  for update using (
    exists (
      select 1 from public.pet_reports r
      where r.id = missing_report_id and r.reporter_id = auth.uid()
    )
  );


-- ====================================================================
-- 0003_storage.sql
-- ====================================================================
-- Beacon - Storage bucket for pet photos & RLS on objects.

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

-- Public read (photos appear in the community feed).
drop policy if exists "pet_photos_public_read" on storage.objects;
create policy "pet_photos_public_read" on storage.objects
  for select using (bucket_id = 'pet-photos');

-- Authenticated users may upload into their own folder: <uid>/<file>.
drop policy if exists "pet_photos_insert_own" on storage.objects;
create policy "pet_photos_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "pet_photos_delete_own" on storage.objects;
create policy "pet_photos_delete_own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ====================================================================
-- 0004_matches_policies.sql
-- ====================================================================
-- Beacon - allow a finder to record smart-match suggestions.
--
-- 0002 gave the two involved report owners SELECT on matches and let the
-- missing-pet owner UPDATE (to confirm/dismiss). This adds a scoped INSERT so
-- the person who filed the *found* report can persist a suggested match, which
-- is what powers the "Notify owner" action. The check ties the insert to a
-- found report the caller actually owns, so no one can spam arbitrary matches.

drop policy if exists "matches_insert_by_finder" on public.matches;
create policy "matches_insert_by_finder" on public.matches
  for insert with check (
    exists (
      select 1 from public.pet_reports r
      where r.id = found_report_id
        and r.reporter_id = auth.uid()
        and r.kind = 'found'
    )
  );


-- ====================================================================
-- 0005_drop_unused_postgis.sql
-- ====================================================================
-- Beacon - remove the unused PostGIS extension.
--
-- An earlier version enabled PostGIS "just in case", but Beacon computes
-- distances with the plain-SQL distance_km() haversine helper and never uses
-- any PostGIS type or function. PostGIS creates public.spatial_ref_sys (a
-- reference table with no RLS), which Supabase's security advisor flags as
-- "rls_disabled_in_public". Dropping the extension removes that table and the
-- warning. It holds only map-projection reference data, never user data.
--
-- Safe: nothing in this schema depends on PostGIS. No-op if it was never
-- installed. Run this on existing databases (new setups skip PostGIS entirely).

drop extension if exists postgis;

