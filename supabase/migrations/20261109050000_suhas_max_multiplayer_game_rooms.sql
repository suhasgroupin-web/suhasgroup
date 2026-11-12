-- SUHAS-MAX Multiplayer Game Room Lobby
create table if not exists public.suhas_game_rooms (
 id uuid primary key default gen_random_uuid(),
 room_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
 game_key text not null check (game_key in ('tic_tac_toe','rock_paper_scissors')),
 host_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'open' check (status in ('open','in_progress','finished','cancelled')),
 max_players integer not null default 2 check (max_players between 2 and 2),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.suhas_game_room_members (
 room_id uuid not null references public.suhas_game_rooms(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'player' check (role in ('host','player')),
 joined_at timestamptz not null default now(),
 primary key(room_id,user_id)
);
alter table public.suhas_game_rooms enable row level security;
alter table public.suhas_game_room_members enable row level security;
grant select,insert,update on public.suhas_game_rooms to authenticated;
grant select,insert,delete on public.suhas_game_room_members to authenticated;
create index if not exists suhas_game_rooms_status_created_idx on public.suhas_game_rooms(status,created_at desc);
create index if not exists suhas_game_room_members_user_idx on public.suhas_game_room_members(user_id);
drop policy if exists "game rooms visible to authenticated members" on public.suhas_game_rooms;
create policy "game rooms visible to authenticated members" on public.suhas_game_rooms for select to authenticated using (status='open' or host_id=(select auth.uid()));
drop policy if exists "users create own game rooms" on public.suhas_game_rooms;
create policy "users create own game rooms" on public.suhas_game_rooms for insert to authenticated with check (host_id=(select auth.uid()));
drop policy if exists "hosts update own game rooms" on public.suhas_game_rooms;
create policy "hosts update own game rooms" on public.suhas_game_rooms for update to authenticated using (host_id=(select auth.uid())) with check (host_id=(select auth.uid()));
drop policy if exists "room members visible to room participants" on public.suhas_game_room_members;
create policy "room members visible to room participants" on public.suhas_game_room_members for select to authenticated using (user_id=(select auth.uid()) or exists(select 1 from public.suhas_game_rooms r where r.id=room_id and (r.status='open' or r.host_id=(select auth.uid()))));
drop policy if exists "hosts add themselves to own game rooms" on public.suhas_game_room_members;
create policy "hosts add themselves to own game rooms" on public.suhas_game_room_members for insert to authenticated with check (user_id=(select auth.uid()) and role='host' and exists(select 1 from public.suhas_game_rooms r where r.id=room_id and r.host_id=(select auth.uid())));
drop policy if exists "users leave own game rooms" on public.suhas_game_room_members;
create policy "users leave own game rooms" on public.suhas_game_room_members for delete to authenticated using (user_id=(select auth.uid()));
create schema if not exists private;
create or replace function private.join_suhas_game_room(p_room_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid := auth.uid(); v_count integer; v_max integer; v_status text;
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 select r.max_players,r.status into v_max,v_status from public.suhas_game_rooms r where r.id=p_room_id for update;
 if not found or v_status <> 'open' then raise exception 'Room is not open'; end if;
 if exists(select 1 from public.suhas_game_room_members m where m.room_id=p_room_id and m.user_id=v_user) then return; end if;
 select count(*) into v_count from public.suhas_game_room_members m where m.room_id=p_room_id;
 if v_count >= v_max then raise exception 'Room is full'; end if;
 insert into public.suhas_game_room_members(room_id,user_id,role) values(p_room_id,v_user,'player');
end; $$;
revoke all on function private.join_suhas_game_room(uuid) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.join_suhas_game_room(uuid) to authenticated;
create or replace function public.join_suhas_game_room(p_room_id uuid)
returns void language sql security definer set search_path='' as $$ select private.join_suhas_game_room(p_room_id); $$;
revoke all on function public.join_suhas_game_room(uuid) from public,anon;
grant execute on function public.join_suhas_game_room(uuid) to authenticated;
