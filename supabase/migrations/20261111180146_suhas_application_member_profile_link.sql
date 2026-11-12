begin;
alter table public.applications drop constraint if exists applications_user_id_fkey;
alter table public.applications add constraint applications_user_id_fkey foreign key(user_id) references auth.users(id) on delete cascade;
alter table public.applications add column if not exists member_profile_id uuid;
alter table public.applications drop constraint if exists applications_member_profile_id_fkey;
alter table public.applications add constraint applications_member_profile_id_fkey foreign key(member_profile_id) references public.suhas_member_profiles(user_id) on delete set null;
create or replace function public.suhas_set_application_member_profile()
returns trigger language plpgsql set search_path=public as $$
begin
 if new.member_profile_id is null and exists(select 1 from public.suhas_member_profiles mp where mp.user_id=new.user_id) then
  new.member_profile_id:=new.user_id;
 end if;
 return new;
end;
$$;
drop trigger if exists suhas_set_application_member_profile on public.applications;
create trigger suhas_set_application_member_profile before insert or update on public.applications
for each row execute function public.suhas_set_application_member_profile();
notify pgrst,'reload schema';
commit;