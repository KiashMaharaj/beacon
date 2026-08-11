-- Beacon - enable realtime for the community feed.
--
-- The app subscribes to postgres_changes on these tables so new reports and
-- sightings appear live on every device. Supabase only broadcasts changes for
-- tables in the supabase_realtime publication, so add them (idempotently).

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pet_reports'
  ) then
    alter publication supabase_realtime add table public.pet_reports;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sightings'
  ) then
    alter publication supabase_realtime add table public.sightings;
  end if;
end $$;
