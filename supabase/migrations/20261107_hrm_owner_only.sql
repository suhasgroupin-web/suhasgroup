-- SUHAS GROUP: enforce single-Owner authorization for all HRM tables.
-- Remove the exact legacy ADMIN policies before installing Owner-only policies.
begin;

drop policy if exists "HR admins manage departments" on public.hr_departments;
drop policy if exists "HR admins manage employees" on public.hr_employees;
drop policy if exists "HR admins manage attendance" on public.hr_attendance;
drop policy if exists "HR admins manage leave requests" on public.hr_leave_requests;
drop policy if exists "HR admins manage shifts" on public.hr_shifts;
drop policy if exists "HR admins manage employee shifts" on public.hr_employee_shifts;
drop policy if exists "HR admins manage payroll" on public.hr_payroll;

create policy "HR owner manages departments" on public.hr_departments
 for all to authenticated
 using (public.has_suhas_role(auth.uid(), array['OWNER']))
 with check (public.has_suhas_role(auth.uid(), array['OWNER']));

create policy "HR owner manages employees" on public.hr_employees
 for all to authenticated
 using (public.has_suhas_role(auth.uid(), array['OWNER']))
 with check (public.has_suhas_role(auth.uid(), array['OWNER']));

create policy "HR owner manages attendance" on public.hr_attendance
 for all to authenticated
 using (public.has_suhas_role(auth.uid(), array['OWNER']))
 with check (public.has_suhas_role(auth.uid(), array['OWNER']));

create policy "HR owner manages leave requests" on public.hr_leave_requests
 for all to authenticated
 using (public.has_suhas_role(auth.uid(), array['OWNER']))
 with check (public.has_suhas_role(auth.uid(), array['OWNER']));

create policy "HR owner manages shifts" on public.hr_shifts
 for all to authenticated
 using (public.has_suhas_role(auth.uid(), array['OWNER']))
 with check (public.has_suhas_role(auth.uid(), array['OWNER']));

create policy "HR owner manages employee shifts" on public.hr_employee_shifts
 for all to authenticated
 using (public.has_suhas_role(auth.uid(), array['OWNER']))
 with check (public.has_suhas_role(auth.uid(), array['OWNER']));

create policy "HR owner manages payroll" on public.hr_payroll
 for all to authenticated
 using (public.has_suhas_role(auth.uid(), array['OWNER']))
 with check (public.has_suhas_role(auth.uid(), array['OWNER']));

notify pgrst, 'reload schema';
commit;
