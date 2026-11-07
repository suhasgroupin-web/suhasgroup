-- SUHAS GROUP: enforce single-Owner authorization for all HRM tables.
-- Existing non-Owner accounts retain no workforce-wide access.
begin;

do $$
declare
  t text;
begin
  foreach t in array array[
    'hr_departments',
    'hr_employees',
    'hr_attendance',
    'hr_leave_requests',
    'hr_shifts',
    'hr_employee_shifts',
    'hr_payroll'
  ]
  loop
    execute format('drop policy if exists %I on public.%I',
      'HR admins manage ' || replace(t, 'hr_', ''), t);
    execute format('drop policy if exists %I on public.%I',
      'HR owner manages ' || replace(t, 'hr_', ''), t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.has_suhas_role(auth.uid(), array[''OWNER''])) with check (public.has_suhas_role(auth.uid(), array[''OWNER'']))',
      'HR owner manages ' || replace(t, 'hr_', ''), t
    );
  end loop;
end
$$;

notify pgrst, 'reload schema';
commit;
