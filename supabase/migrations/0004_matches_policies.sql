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
