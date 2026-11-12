create or replace function private.enforce_suhas_public_profile_preferences()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare pref public.suhas_account_preferences%rowtype;
begin
 select * into pref from public.suhas_account_preferences where user_id=new.user_id;
 if found then
  if not pref.show_company then new.company := null; end if;
  if not pref.show_location then new.location := null; end if;
  if not pref.show_skills then new.skills := null; end if;
  if not pref.profile_searchable then new.profile_complete := false; end if;
 end if;
 return new;
end;
$$;
drop trigger if exists suhas_public_profile_privacy_guard on public.suhas_public_profiles;
create trigger suhas_public_profile_privacy_guard before insert or update on public.suhas_public_profiles
for each row execute function private.enforce_suhas_public_profile_preferences();