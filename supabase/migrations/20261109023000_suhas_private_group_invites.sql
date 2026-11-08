create table if not exists public.suhas_group_invites (
 id uuid primary key default gen_random_uuid(),
 group_id uuid not null references public.suhas_groups(id) on delete cascade,
 inviter_id uuid not null references auth.users(id) on delete cascade,
 invitee_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
 created_at timestamptz not null default now(),
 responded_at timestamptz,
 unique(group_id, invitee_id)
);
alter table public.suhas_group_invites enable row level security;
create policy "Group members invite to private groups" on public.suhas_group_invites for insert to authenticated
with check (inviter_id = (select auth.uid()) and exists (
 select 1 from public.suhas_group_members gm where gm.group_id = suhas_group_invites.group_id
 and gm.user_id = (select auth.uid()) and gm.role in ('owner','admin')
));
create policy "Invite participants read their invites" on public.suhas_group_invites for select to authenticated
using (invitee_id = (select auth.uid()) or inviter_id = (select auth.uid()));
create policy "Invitees respond to invitations" on public.suhas_group_invites for update to authenticated
using (invitee_id = (select auth.uid()) and status = 'pending')
with check (invitee_id = (select auth.uid()) and status in ('accepted','declined'));
create or replace function private.apply_suhas_group_invite_response()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 if old.status = 'pending' and new.status = 'accepted' then
  insert into public.suhas_group_members(group_id,user_id,role) values(new.group_id,new.invitee_id,'member')
  on conflict (group_id,user_id) do nothing;
  new.responded_at = now();
 elsif old.status = 'pending' and new.status = 'declined' then
  new.responded_at = now();
 end if;
 return new;
end;
$$;
create trigger suhas_group_invite_response before update of status on public.suhas_group_invites
for each row execute function private.apply_suhas_group_invite_response();
grant select, insert, update on public.suhas_group_invites to authenticated;