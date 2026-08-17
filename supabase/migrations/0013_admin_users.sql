-- Beacon - admin user directory.
--
-- Lets an admin see who has signed up (name, email, join date, report count)
-- from the in-app admin dashboard. Emails live in auth.users, which clients
-- can't read directly, so this is a security-definer function gated on
-- public.is_admin() — non-admins get zero rows, never an error that leaks
-- existence. Returns newest sign-ups first.

create or replace function public.admin_list_users()
  returns table (
    id uuid,
    email text,
    full_name text,
    is_admin boolean,
    created_at timestamptz,
    reports_count bigint
  )
  language sql
  stable
  security definer
  set search_path = public
as $$
  select
    p.id,
    u.email::text as email,
    p.full_name,
    p.is_admin,
    p.created_at,
    (select count(*) from public.pet_reports r where r.reporter_id = p.id) as reports_count
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc;
$$;

-- Only signed-in users can call it; the is_admin() guard inside does the real
-- gating. Revoke from anon so it isn't reachable without a session at all.
revoke all on function public.admin_list_users() from anon;
grant execute on function public.admin_list_users() to authenticated;
