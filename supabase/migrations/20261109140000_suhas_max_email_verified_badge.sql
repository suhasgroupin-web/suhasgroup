-- Email verification badge for SUHAS-MAX.
-- The value is sourced only from Supabase Auth email_confirmed_at; users cannot set it.
alter table public.suhas_public_profiles
  add column if not exists email_verified boolean not null default false,
  add column if not exists email_verified_at timestamptz;

create or replace function private.sync_suhas_email_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  update public.suhas_public_profiles
     set email_verified = (new.email_confirmed_at is not null),
         email_verified_at = new.email_confirmed_at,
         updated_at = now()
   where user_id = new.id;
  return new;
end;
$function$;

revoke all on function private.sync_suhas_email_verification() from public, anon, authenticated;

drop trigger if exists suhas_sync_email_verification on auth.users;
create trigger suhas_sync_email_verification
after insert or update of email_confirmed_at on auth.users
for each row execute function private.sync_suhas_email_verification();

create or replace function private.sync_suhas_public_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare verified_at_value timestamptz;
begin
 select u.email_confirmed_at into verified_at_value
 from auth.users u where u.id = new.user_id;

 insert into public.suhas_public_profiles(
   user_id,full_name,company,position,location,skills,profile_photo_url,
   profile_complete,updated_at,email_verified,email_verified_at
 )
 values(
   new.user_id,new.full_name,new.company,new.position,new.location,new.skills,
   new.profile_photo_url,coalesce(new.profile_complete,false),now(),
   verified_at_value is not null,verified_at_value
 )
 on conflict(user_id) do update set
   full_name=excluded.full_name,
   company=excluded.company,
   position=excluded.position,
   location=excluded.location,
   skills=excluded.skills,
   profile_photo_url=excluded.profile_photo_url,
   profile_complete=excluded.profile_complete,
   email_verified=excluded.email_verified,
   email_verified_at=excluded.email_verified_at,
   updated_at=now();
 return new;
end;
$function$;

update public.suhas_public_profiles p
set email_verified = (u.email_confirmed_at is not null),
    email_verified_at = u.email_confirmed_at,
    updated_at = now()
from auth.users u
where u.id = p.user_id;
