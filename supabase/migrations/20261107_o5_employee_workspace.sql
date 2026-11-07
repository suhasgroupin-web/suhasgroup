-- O5 International account separation
-- O5-domain registrations remain ordinary USER accounts and receive a separate
-- employee workspace record plus a private per-user file folder.
begin;

create table if not exists public.o5_employee_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  department text,
  employee_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint o5_employee_email_domain check (lower(email) like '%@o5-intl.com')
);

alter table public.o5_employee_profiles enable row level security;

drop policy if exists "O5 users read own employee profile" on public.o5_employee_profiles;
create policy "O5 users read own employee profile"
on public.o5_employee_profiles for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "O5 users update own employee profile" on public.o5_employee_profiles;
create policy "O5 users update own employee profile"
on public.o5_employee_profiles for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "SUHAS owner admins manage O5 employee profiles" on public.o5_employee_profiles;
create policy "SUHAS owner admins manage O5 employee profiles"
on public.o5_employee_profiles for all to authenticated
using (public.has_suhas_role(auth.uid(), array['OWNER','ADMIN']))
with check (public.has_suhas_role(auth.uid(), array['OWNER','ADMIN']));

grant select, update on public.o5_employee_profiles to authenticated;

create or replace function public.suhas_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles(user_id, role)
  values (
    new.id,
    case when lower(coalesce(new.email,'')) = 'suhasgroup.in@gmail.com'
      then 'OWNER' else 'USER' end
  )
  on conflict (user_id) do update
    set role = case
      when lower(coalesce(new.email,'')) = 'suhasgroup.in@gmail.com' then 'OWNER'
      else public.user_roles.role
    end,
    updated_at = now();

  if lower(coalesce(new.email,'')) like '%@o5-intl.com' then
    insert into public.o5_employee_profiles(user_id, full_name, email)
    values (new.id, new.raw_user_meta_data->>'full_name', lower(new.email))
    on conflict (user_id) do update
      set full_name = coalesce(excluded.full_name, public.o5_employee_profiles.full_name),
          email = excluded.email,
          updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_suhas_role on auth.users;
create trigger on_auth_user_created_suhas_role
after insert on auth.users
for each row execute function public.suhas_handle_new_user();

-- Private O5 employee files. Each user's files live under their own UUID folder.
insert into storage.buckets (id, name, public)
values ('o5-employee-files', 'o5-employee-files', false)
on conflict (id) do update set public = false;

drop policy if exists "O5 users access own private folder" on storage.objects;
create policy "O5 users access own private folder"
on storage.objects for all to authenticated
using (
  bucket_id = 'o5-employee-files'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'o5-employee-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "SUHAS admins access O5 private files" on storage.objects;
create policy "SUHAS admins access O5 private files"
on storage.objects for all to authenticated
using (
  bucket_id = 'o5-employee-files'
  and public.has_suhas_role(auth.uid(), array['OWNER','ADMIN'])
)
with check (
  bucket_id = 'o5-employee-files'
  and public.has_suhas_role(auth.uid(), array['OWNER','ADMIN'])
);

notify pgrst, 'reload schema';
commit;
