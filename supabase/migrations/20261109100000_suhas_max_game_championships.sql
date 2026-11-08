-- SUHAS-MAX free scheduled championship registration
create table if not exists public.suhas_game_tournaments (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(btrim(title)) between 3 and 80),
 description text not null default '' check (char_length(description)<=400),
 game_key text not null check (game_key in ('tic_tac_toe','rock_paper_scissors')),
 starts_at timestamptz not null,
 max_players integer not null default 8 check (max_players in (4,8,16,32)),
 status text not null default 'registration' check (status in ('registration','in_progress','completed','cancelled')),
 created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.suhas_game_tournament_players (
 tournament_id uuid not null references public.suhas_game_tournaments(id) on delete cascade,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 joined_at timestamptz not null default now(),
 primary key(tournament_id,user_id)
);
create index if not exists suhas_game_tournaments_schedule_idx on public.suhas_game_tournaments(status,starts_at);
create index if not exists suhas_game_tournament_players_user_idx on public.suhas_game_tournament_players(user_id);
alter table public.suhas_game_tournaments enable row level security;
alter table public.suhas_game_tournament_players enable row level security;
drop policy if exists suhas_game_tournaments_authenticated_read on public.suhas_game_tournaments;
create policy suhas_game_tournaments_authenticated_read on public.suhas_game_tournaments for select to authenticated using (true);
drop policy if exists suhas_game_tournament_players_authenticated_read on public.suhas_game_tournament_players;
create policy suhas_game_tournament_players_authenticated_read on public.suhas_game_tournament_players for select to authenticated using (true);
revoke all on public.suhas_game_tournaments from anon,authenticated;
revoke all on public.suhas_game_tournament_players from anon,authenticated;
grant select on public.suhas_game_tournaments,public.suhas_game_tournament_players to authenticated;

create or replace function private.create_suhas_game_tournament(p_title text,p_description text,p_game_key text,p_starts_at timestamptz,p_max_players integer)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_title is null or char_length(btrim(p_title)) not between 3 and 80 then raise exception 'Title must be 3–80 characters'; end if;
 if p_description is not null and char_length(p_description)>400 then raise exception 'Description is too long'; end if;
 if p_game_key not in ('tic_tac_toe','rock_paper_scissors') then raise exception 'Invalid game'; end if;
 if p_starts_at is null or p_starts_at < now()+interval '10 minutes' then raise exception 'Choose a start time at least 10 minutes in the future'; end if;
 if p_max_players not in (4,8,16,32) then raise exception 'Invalid player capacity'; end if;
 insert into public.suhas_game_tournaments(title,description,game_key,starts_at,max_players,created_by)
 values(btrim(p_title),coalesce(p_description,''),p_game_key,p_starts_at,p_max_players,auth.uid()) returning id into v_id;
 insert into public.suhas_game_tournament_players(tournament_id,user_id) values(v_id,auth.uid());
 return v_id;
end;$$;

create or replace function public.join_suhas_game_tournament(p_tournament_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_t public.suhas_game_tournaments%rowtype; v_count integer;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_t from public.suhas_game_tournaments where id=p_tournament_id for update;
 if not found then raise exception 'Championship not found'; end if;
 if v_t.status<>'registration' then raise exception 'Registration is closed'; end if;
 if v_t.starts_at<=now() then raise exception 'Registration deadline has passed'; end if;
 select count(*) into v_count from public.suhas_game_tournament_players where tournament_id=p_tournament_id;
 if exists(select 1 from public.suhas_game_tournament_players where tournament_id=p_tournament_id and user_id=auth.uid()) then return true; end if;
 if v_count>=v_t.max_players then raise exception 'Championship is full'; end if;
 insert into public.suhas_game_tournament_players(tournament_id,user_id) values(p_tournament_id,auth.uid());
 return true;
end;$$;

create or replace function private.join_suhas_game_tournament(p_tournament_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_t public.suhas_game_tournaments%rowtype; v_count integer;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_t from public.suhas_game_tournaments where id=p_tournament_id for update;
 if not found then raise exception 'Championship not found'; end if;
 if v_t.status<>'registration' then raise exception 'Registration is closed'; end if;
 if v_t.starts_at<=now() then raise exception 'Registration deadline has passed'; end if;
 select count(*) into v_count from public.suhas_game_tournament_players where tournament_id=p_tournament_id;
 if exists(select 1 from public.suhas_game_tournament_players where tournament_id=p_tournament_id and user_id=auth.uid()) then return true; end if;
 if v_count>=v_t.max_players then raise exception 'Championship is full'; end if;
 insert into public.suhas_game_tournament_players(tournament_id,user_id) values(p_tournament_id,auth.uid());
 return true;
end;$$;

revoke all on function private.create_suhas_game_tournament(text,text,text,timestamptz,integer) from public,anon,authenticated;
revoke all on function private.join_suhas_game_tournament(uuid) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.create_suhas_game_tournament(text,text,text,timestamptz,integer) to authenticated;
grant execute on function private.join_suhas_game_tournament(uuid) to authenticated;
create or replace function public.create_suhas_game_tournament(p_title text,p_description text,p_game_key text,p_starts_at timestamptz,p_max_players integer)
returns uuid language sql security invoker set search_path=''
as $$ select private.create_suhas_game_tournament(p_title,p_description,p_game_key,p_starts_at,p_max_players); $$;
create or replace function public.join_suhas_game_tournament(p_tournament_id uuid)
returns boolean language sql security invoker set search_path=''
as $$ select private.join_suhas_game_tournament(p_tournament_id); $$;
revoke all on function public.create_suhas_game_tournament(text,text,text,timestamptz,integer) from public,anon;
revoke all on function public.join_suhas_game_tournament(uuid) from public,anon;
grant execute on function public.create_suhas_game_tournament(text,text,text,timestamptz,integer) to authenticated;
grant execute on function public.join_suhas_game_tournament(uuid) to authenticated;
