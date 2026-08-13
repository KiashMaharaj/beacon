-- Beacon - newsletter / marketing subscribers.
--
-- Captures people who opt in to marketing emails: at sign-up (via a checkbox)
-- and from the public landing page footer. POPIA: marketing consent is separate
-- and opt-in only, so we only ever store rows where consented = true, and keep a
-- timestamp so opt-in can be evidenced and honoured.

create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  user_id         uuid references auth.users(id) on delete set null,
  source          text not null default 'signup',
  consented       boolean not null default true,
  created_at      timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone may opt in (authenticated at sign-up, anonymous from the landing page),
-- but only for a genuine opt-in row.
drop policy if exists "newsletter_insert_any" on public.newsletter_subscribers;
create policy "newsletter_insert_any" on public.newsletter_subscribers
  for insert
  with check (consented = true);

-- The list itself is private - only admins can read it.
drop policy if exists "newsletter_select_admin" on public.newsletter_subscribers;
create policy "newsletter_select_admin" on public.newsletter_subscribers
  for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
