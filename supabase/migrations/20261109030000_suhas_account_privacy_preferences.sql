create table if not exists public.suhas_account_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 profile_searchable boolean not null default true,
 show_company boolean not null default true,
 show_location boolean not null default true,
 show_skills boolean not null default true,
 allow_friend_requests boolean not null default true,
 allow_messages text not null default 'everyone' check (allow_messages in ('everyone','friends','nobody')),
 email_notifications boolean not null default true,
 updated_at timestamptz not null default now()
);
alter table public.suhas_account_preferences enable row level security;
drop policy if exists "Members read own account preferences" on public.suhas_account_preferences;
create policy "Members read own account preferences" on public.suhas_account_preferences for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Members create own account preferences" on public.suhas_account_preferences;
create policy "Members create own account preferences" on public.suhas_account_preferences for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Members update own account preferences" on public.suhas_account_preferences;
create policy "Members update own account preferences" on public.suhas_account_preferences for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.suhas_account_preferences to authenticated;
create or replace function private.sync_suhas_public_profile_privacy()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 update public.suhas_public_profiles p
 set company = case when new.show_company then (select m.company from public.suhas_member_profiles m where m.user_id=new.user_id) else null end,
     location = case when new.show_location then (select m.location from public.suhas_member_profiles m where m.user_id=new.user_id) else null end,
     skills = case when new.show_skills then (select m.skills from public.suhas_member_profiles m where m.user_id=new.user_id) else null end,
     profile_complete = case when new.profile_searchable then coalesce((select m.profile_complete from public.suhas_member_profiles m where m.user_id=new.user_id),false) else false end,
     updated_at = now()
 where p.user_id = new.user_id;
 return new;
end;
$$;
drop trigger if exists suhas_account_preferences_privacy_sync on public.suhas_account_preferences;
create trigger suhas_account_preferences_privacy_sync after insert or update of profile_searchable,show_company,show_location,show_skills on public.suhas_account_preferences
for each row execute function private.sync_suhas_public_profile_privacy();