-- Beacon - find push targets for a new missing-pet report.
--
-- Returns the distinct device tokens of users who: have push enabled, have an
-- active saved area that overlaps the report's location, whose area species
-- filter matches, and who are not the reporter. Used by the notify-nearby Edge
-- Function. security definer so the function can read across users' private
-- prefs while callers still can't.

create or replace function public.nearby_push_targets(
  p_lat      double precision,
  p_lng      double precision,
  p_species  pet_species,
  p_exclude  uuid
) returns table (push_token text)
  language sql
  stable
  security definer
  set search_path = public
as $$
  select distinct np.push_token
  from public.alert_areas a
  join public.notification_prefs np on np.user_id = a.user_id
  where a.is_active
    and np.alerts_enabled
    and np.push_token is not null
    and a.user_id <> p_exclude
    and (
      a.species_filter = 'all'
      or (a.species_filter = 'dogs' and p_species = 'dog')
      or (a.species_filter = 'cats' and p_species = 'cat')
    )
    and public.distance_km(a.lat, a.lng, p_lat, p_lng) <= a.radius_km;
$$;
