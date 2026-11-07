-- Enforce a single privileged account: only the bootstrapped Owner may administer.
-- All other existing elevated roles are reduced to ordinary USER.
begin;

-- Ensure the known Owner account is marked as OWNER if it exists.
update public.user_roles ur
set role = 'OWNER', updated_at = now()
from auth.users u
where ur.user_id = u.id
  and lower(coalesce(u.email,'')) = 'suhasgroup.in@gmail.com';

-- No additional ADMIN or EDITOR accounts remain privileged.
update public.user_roles
set role = 'USER', updated_at = now()
where role in ('ADMIN','EDITOR');

-- Only Owner can create, edit, or delete jobs from authenticated clients.
drop policy if exists "SUHAS owner/admin/editor manage jobs" on public.jobs;
create policy "SUHAS owner only manage jobs"
on public.jobs
for all to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER']))
with check (public.has_suhas_role(auth.uid(), array['OWNER']));

-- Restrict private O5 employee records and files to the employee and Owner.
drop policy if exists "SUHAS owner admins manage O5 employee profiles" on public.o5_employee_profiles;
create policy "SUHAS owner manages O5 employee profiles"
on public.o5_employee_profiles
for all to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER']))
with check (public.has_suhas_role(auth.uid(), array['OWNER']));

drop policy if exists "SUHAS admins access O5 private files" on storage.objects;
create policy "SUHAS owner accesses O5 private files"
on storage.objects
for all to authenticated
using (
  bucket_id = 'o5-employee-files'
  and public.has_suhas_role(auth.uid(), array['OWNER'])
)
with check (
  bucket_id = 'o5-employee-files'
  and public.has_suhas_role(auth.uid(), array['OWNER'])
);

drop policy if exists "Owner and admin can read audit logs" on public.audit_logs;
create policy "Owner can read audit logs"
on public.audit_logs
for select to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER']));

notify pgrst, 'reload schema';
commit;

-- Verify the sole privileged account:
select u.email, ur.role
from auth.users u
join public.user_roles ur on ur.user_id = u.id
where ur.role in ('OWNER','ADMIN','EDITOR');
