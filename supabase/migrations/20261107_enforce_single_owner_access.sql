-- Enforce the single-OWNER model across O5 employee data and job management.
begin;

-- No ADMIN or EDITOR account may gain elevated access through helper RPCs.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_suhas_role(auth.uid(), array['OWNER']);
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_suhas_role(auth.uid(), array['OWNER']);
$$;

drop policy if exists "SUHAS owner admins manage O5 employee profiles" on public.o5_employee_profiles;
drop policy if exists "SUHAS owner only manage O5 employee profiles" on public.o5_employee_profiles;
create policy "SUHAS owner only manage O5 employee profiles"
on public.o5_employee_profiles for all to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER']))
with check (public.has_suhas_role(auth.uid(), array['OWNER']));

drop policy if exists "SUHAS admins access O5 private files" on storage.objects;
drop policy if exists "SUHAS owner only access O5 private files" on storage.objects;
create policy "SUHAS owner only access O5 private files"
on storage.objects for all to authenticated
using (
  bucket_id = 'o5-employee-files'
  and public.has_suhas_role(auth.uid(), array['OWNER'])
)
with check (
  bucket_id = 'o5-employee-files'
  and public.has_suhas_role(auth.uid(), array['OWNER'])
);

drop policy if exists "SUHAS owner/admin/editor manage jobs" on public.jobs;
drop policy if exists "SUHAS owner only manage jobs" on public.jobs;
create policy "SUHAS owner only manage jobs" on public.jobs
for all to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER']))
with check (public.has_suhas_role(auth.uid(), array['OWNER']));

notify pgrst, 'reload schema';
commit;
