-- Beacon — Row Level Security policies
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
