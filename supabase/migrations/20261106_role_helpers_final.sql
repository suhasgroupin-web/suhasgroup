-- SUHAS GROUP role helper functions and public published-job read support.
-- Safe to run repeatedly in Supabase SQL Editor after the role foundation migration.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_suhas_role(auth.uid(), array['OWNER','ADMIN']);
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_suhas_role(auth.uid(), array['OWNER','ADMIN','EDITOR']);
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_editor() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_editor() to anon, authenticated;
