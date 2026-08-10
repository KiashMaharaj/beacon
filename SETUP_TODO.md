# ⏳ Beacon — outstanding setup steps

Code is done and deployed. These are the **Supabase steps** left to activate the
newest features. Do them when you're back at a computer.

## 1. Password reset (#2) — just verify
- Supabase → Auth → URL Configuration → confirm `https://beacon-six-chi.vercel.app/**`
  is in the Redirect URLs (it covers `/auth/reset`). Nothing to deploy.

## 2. Delete account (#3) — deploy one function
- Supabase → Edge Functions → **Deploy a new function** → *Via Editor*
- Name: `delete-account`
- Paste code from `supabase/functions/delete-account/index.ts` (GitHub) → Deploy
- **Leave "Verify JWT" ON.** No secrets needed.

## 3. Notify owner on smart match (#4) — SQL + update function + trigger
**a. Run in SQL Editor:**
```sql
create or replace function public.report_owner_targets(p_report uuid)
  returns table (push_token text) language sql stable security definer set search_path = public as $$
  select np.push_token from public.pet_reports r
  join public.notification_prefs np on np.user_id = r.reporter_id
  where r.id = p_report and np.push_token is not null;
$$;
```
**b. Update the `notify-nearby` function** — open it in the dashboard editor and
replace its code with the latest `supabase/functions/notify-nearby/index.ts`
(GitHub), then Deploy. (It now handles both nearby reports AND matches.)

**c. Add the match trigger** (swap in your real webhook secret):
```sql
create or replace function public.on_match_notify()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url     := 'https://lecazegxgmjzolkvtbyf.supabase.co/functions/v1/notify-nearby',
    headers := jsonb_build_object('Content-Type','application/json','x-webhook-secret','YOUR-WEBHOOK-SECRET'),
    body    := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end $$;

drop trigger if exists trg_match_notify on public.matches;
create trigger trg_match_notify after insert on public.matches
  for each row execute function public.on_match_notify();
```

## Also pending (from earlier)
- Confirm the **missing-pet push** works end to end (post a missing report in a
  saved area, check `notify-nearby` logs for `{"sent":1,"targeted":1}`).

> Tip: the full combined SQL is always in `supabase/setup.sql`.
