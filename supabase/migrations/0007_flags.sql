-- Beacon - content flags (neighbours report a post for moderation).
--
-- Any signed-in user can flag a report; only admins can read or clear flags.

create table if not exists public.flags (
  id           uuid primary key default gen_random_uuid(),
  report_id    uuid not null references public.pet_reports(id) on delete cascade,
  reporter_id  uuid references public.profiles(id) on delete set null,
  reason       text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_flags_report on public.flags (report_id);
create index if not exists idx_flags_created on public.flags (created_at desc);

alter table public.flags enable row level security;

-- Any authenticated user may file a flag as themselves.
drop policy if exists "flags_insert_auth" on public.flags;
create policy "flags_insert_auth" on public.flags
  for insert to authenticated with check (auth.uid() = reporter_id);

-- Only admins can read flags (keeps reporters private).
drop policy if exists "flags_select_admin" on public.flags;
create policy "flags_select_admin" on public.flags
  for select using (public.is_admin());

-- Only admins can dismiss (delete) a flag.
drop policy if exists "flags_delete_admin" on public.flags;
create policy "flags_delete_admin" on public.flags
  for delete using (public.is_admin());
