-- Final single-OWNER hardening for application, profile, audit and AI logs.
begin;

drop policy if exists "Admin update applications" on public.applications;
drop policy if exists "SUHAS owner/admin read applications" on public.applications;
drop policy if exists "SUHAS owner only read applications" on public.applications;
create policy "SUHAS owner only read applications"
on public.applications for select to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER']));

create policy "SUHAS owner only update applications"
on public.applications for update to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER']))
with check (public.has_suhas_role(auth.uid(), array['OWNER']));

drop policy if exists "SUHAS owner/admin read profiles" on public.profiles;
drop policy if exists "SUHAS owner only read profiles" on public.profiles;
create policy "SUHAS owner only read profiles"
on public.profiles for select to authenticated
using (
  auth.uid() = id
  or public.has_suhas_role(auth.uid(), array['OWNER'])
);

drop policy if exists "Owner and admin can read audit logs" on public.audit_logs;
drop policy if exists "Owner can read audit logs" on public.audit_logs;
drop policy if exists "SUHAS owner only read audit logs" on public.audit_logs;
create policy "SUHAS owner only read audit logs"
on public.audit_logs for select to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER']));

drop policy if exists "Users can read own AI usage" on public.ai_usage_logs;
create policy "Users can read own AI usage"
on public.ai_usage_logs for select to authenticated
using (
  auth.uid() = user_id
  or public.has_suhas_role(auth.uid(), array['OWNER'])
);

notify pgrst, 'reload schema';
commit;
