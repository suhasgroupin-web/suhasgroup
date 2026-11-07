-- SUHAS GROUP member profile data and profile photo storage
begin;
create table if not exists public.suhas_member_profiles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null, full_name text, mobile text, gender text, dob date, location text,
 company text, position text, education_level text, major text, school text, college text,
 university text, graduation_year integer, study_status text, bio text, skills text,
 linkedin_url text, profile_photo_url text, profile_complete boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.suhas_member_profiles enable row level security;
drop policy if exists "Members read own profile" on public.suhas_member_profiles;
create policy "Members read own profile" on public.suhas_member_profiles for select to authenticated using(auth.uid()=user_id);
drop policy if exists "Members insert own profile" on public.suhas_member_profiles;
create policy "Members insert own profile" on public.suhas_member_profiles for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Members update own profile" on public.suhas_member_profiles;
create policy "Members update own profile" on public.suhas_member_profiles for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "SUHAS owners read member profiles" on public.suhas_member_profiles;
create policy "SUHAS owners read member profiles" on public.suhas_member_profiles for select to authenticated using(public.has_suhas_role(auth.uid(),array['OWNER']));
drop policy if exists "SUHAS owners manage member profiles" on public.suhas_member_profiles;
create policy "SUHAS owners manage member profiles" on public.suhas_member_profiles for all to authenticated using(public.has_suhas_role(auth.uid(),array['OWNER'])) with check(public.has_suhas_role(auth.uid(),array['OWNER']));
grant select,insert,update on public.suhas_member_profiles to authenticated;
create or replace function public.suhas_create_member_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.suhas_member_profiles(user_id,email,full_name) values(new.id,lower(new.email),new.raw_user_meta_data->>'full_name') on conflict(user_id) do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_create_member_profile on auth.users;
create trigger on_auth_user_create_member_profile after insert on auth.users for each row execute function public.suhas_create_member_profile();
insert into public.suhas_member_profiles(user_id,email,full_name)
select id,lower(email),raw_user_meta_data->>'full_name' from auth.users on conflict(user_id) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('member-avatars','member-avatars',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Public read member avatars" on storage.objects;
create policy "Public read member avatars" on storage.objects for select to public using(bucket_id='member-avatars');
drop policy if exists "Members upload own avatar" on storage.objects;
create policy "Members upload own avatar" on storage.objects for insert to authenticated with check(bucket_id='member-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Members update own avatar" on storage.objects;
create policy "Members update own avatar" on storage.objects for update to authenticated using(bucket_id='member-avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='member-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Members delete own avatar" on storage.objects;
create policy "Members delete own avatar" on storage.objects for delete to authenticated using(bucket_id='member-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
notify pgrst,'reload schema';
commit;