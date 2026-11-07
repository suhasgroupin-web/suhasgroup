-- Backfill O5 accounts that existed before the O5 workspace trigger.
begin;
insert into public.o5_employee_profiles(user_id, full_name, email)
select u.id, u.raw_user_meta_data->>'full_name', lower(u.email)
from auth.users u
where lower(coalesce(u.email,'')) like '%@o5-intl.com'
on conflict (user_id) do update
set full_name = coalesce(excluded.full_name, public.o5_employee_profiles.full_name),
    email = excluded.email,
    updated_at = now();

-- O5 email-domain accounts are always ordinary USER accounts, never Admin.
update public.user_roles ur
set role = 'USER', updated_at = now()
from auth.users u
where ur.user_id = u.id
  and lower(coalesce(u.email,'')) like '%@o5-intl.com'
  and ur.role <> 'USER';

notify pgrst, 'reload schema';
commit;
