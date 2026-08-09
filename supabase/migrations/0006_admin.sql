-- Beacon - admin / moderation support.
--
-- Adds an is_admin flag on profiles, a helper to check it, RLS policies that let
-- admins moderate (delete/edit) any report or sighting, and a guard so ordinary
-- users can never promote themselves.

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- True when the current user is an admin. security definer so it can read the
-- flag regardless of the caller's row-level permissions.
create or replace function public.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin);
$$;

-- Admins may do anything to reports and sightings (moderation).
drop policy if exists "reports_admin_all" on public.pet_reports;
create policy "reports_admin_all" on public.pet_reports
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sightings_admin_all" on public.sightings;
create policy "sightings_admin_all" on public.sightings
  for all using (public.is_admin()) with check (public.is_admin());

-- Prevent privilege escalation: an authenticated non-admin cannot change the
-- is_admin flag (on their own row or any other). Changes made from the SQL
-- editor / service role (auth.uid() is null) are allowed, which is how you
-- bootstrap the first admin.
create or replace function public.prevent_admin_escalation()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_no_escalation on public.profiles;
create trigger trg_profiles_no_escalation
  before update on public.profiles
  for each row execute function public.prevent_admin_escalation();

-- Bootstrap the first admin. Replace the email if needed, then this is a no-op
-- on re-run once the flag is set.
update public.profiles
  set is_admin = true
  where id in (select id from auth.users where lower(email) = lower('kiash.maharaj@gmail.com'));
