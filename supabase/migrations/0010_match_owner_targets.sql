-- Beacon - push targets for a smart-match notification.
--
-- Returns the device token(s) of the owner of a (missing) report, so the
-- notify-nearby function can tell them a found pet might be theirs. security
-- definer so it can read the owner's private prefs.

create or replace function public.report_owner_targets(p_report uuid)
  returns table (push_token text)
  language sql
  stable
  security definer
  set search_path = public
as $$
  select np.push_token
  from public.pet_reports r
  join public.notification_prefs np on np.user_id = r.reporter_id
  where r.id = p_report
    and np.push_token is not null;
$$;
