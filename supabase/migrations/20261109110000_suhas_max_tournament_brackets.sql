-- SUHAS-MAX automatic single-elimination tournament brackets and organizer-verified results
create table if not exists public.suhas_game_tournament_matches(
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.suhas_game_tournaments(id) on delete cascade,
 round_number integer not null check(round_number>0), match_number integer not null check(match_number>0),
 player1_id uuid references auth.users(id) on delete set null, player2_id uuid references auth.users(id) on delete set null,
 winner_id uuid references auth.users(id) on delete set null, status text not null default 'pending' check(status in ('pending','completed','bye')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(tournament_id,round_number,match_number)
);
alter table public.suhas_game_tournament_matches enable row level security;
drop policy if exists suhas_game_tournament_matches_read on public.suhas_game_tournament_matches;
create policy suhas_game_tournament_matches_read on public.suhas_game_tournament_matches for select to authenticated using(true);
revoke all on public.suhas_game_tournament_matches from anon,authenticated;
grant select on public.suhas_game_tournament_matches to authenticated;
create or replace function private.start_suhas_game_tournament(p_tournament_id uuid)
returns integer language plpgsql security definer set search_path=''
as $$
declare t public.suhas_game_tournaments%rowtype; ids uuid[]; n integer; bracket_size integer:=1; i integer; p1 uuid; p2 uuid; created integer:=0;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into t from public.suhas_game_tournaments where id=p_tournament_id for update;
 if not found or t.created_by<>auth.uid() then raise exception 'Only the organizer can start this championship' using errcode='42501'; end if;
 if t.status<>'registration' then raise exception 'Championship has already started'; end if;
 if now()<t.starts_at then raise exception 'Championship start time has not arrived'; end if;
 select array_agg(user_id order by joined_at,user_id) into ids from public.suhas_game_tournament_players where tournament_id=p_tournament_id;
 n:=coalesce(array_length(ids,1),0); if n<2 then raise exception 'At least two registered players are required'; end if;
 while bracket_size<n loop bracket_size:=bracket_size*2; end loop;
 update public.suhas_game_tournaments set status='in_progress',updated_at=now() where id=p_tournament_id;
 for i in 1..(bracket_size/2) loop
  p1:=case when i*2-1<=n then ids[i*2-1] else null end; p2:=case when i*2<=n then ids[i*2] else null end;
  insert into public.suhas_game_tournament_matches(tournament_id,round_number,match_number,player1_id,player2_id,winner_id,status)
  values(p_tournament_id,1,i,p1,p2,case when p1 is null then p2 when p2 is null then p1 else null end,case when p1 is null or p2 is null then 'bye' else 'pending' end);
  created:=created+1;
 end loop; return created;
end;$$;
create or replace function private.record_suhas_game_tournament_result(p_match_id uuid,p_winner_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare m public.suhas_game_tournament_matches%rowtype; t public.suhas_game_tournaments%rowtype; ids uuid[]; total_matches integer; done_matches integer; next_round integer; i integer; next_count integer;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into m from public.suhas_game_tournament_matches where id=p_match_id for update;
 if not found then raise exception 'Match not found'; end if;
 select * into t from public.suhas_game_tournaments where id=m.tournament_id for update;
 if t.created_by<>auth.uid() then raise exception 'Only the organizer can confirm results' using errcode='42501'; end if;
 if m.status<>'pending' then raise exception 'This match is not awaiting a result'; end if;
 if p_winner_id is null or p_winner_id not in (m.player1_id,m.player2_id) then raise exception 'Winner must be one of the two players'; end if;
 update public.suhas_game_tournament_matches set winner_id=p_winner_id,status='completed',updated_at=now() where id=p_match_id;
 select count(*),count(*) filter(where status in ('completed','bye')) into total_matches,done_matches from public.suhas_game_tournament_matches where tournament_id=m.tournament_id and round_number=m.round_number;
 if total_matches=done_matches then
  select array_agg(winner_id order by match_number) into ids from public.suhas_game_tournament_matches where tournament_id=m.tournament_id and round_number=m.round_number and winner_id is not null;
  if coalesce(array_length(ids,1),0)=1 then update public.suhas_game_tournaments set status='completed',updated_at=now() where id=m.tournament_id;
  else
   next_round:=m.round_number+1; next_count:=array_length(ids,1)/2;
   for i in 1..next_count loop
    insert into public.suhas_game_tournament_matches(tournament_id,round_number,match_number,player1_id,player2_id)
    values(m.tournament_id,next_round,i,ids[i*2-1],ids[i*2]);
   end loop;
  end if;
 end if; return true;
end;$$;
revoke all on function private.start_suhas_game_tournament(uuid) from public,anon,authenticated;
revoke all on function private.record_suhas_game_tournament_result(uuid,uuid) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.start_suhas_game_tournament(uuid) to authenticated;
grant execute on function private.record_suhas_game_tournament_result(uuid,uuid) to authenticated;
create or replace function public.start_suhas_game_tournament(p_tournament_id uuid) returns integer language sql security invoker set search_path='' as $$ select private.start_suhas_game_tournament(p_tournament_id); $$;
create or replace function public.record_suhas_game_tournament_result(p_match_id uuid,p_winner_id uuid) returns boolean language sql security invoker set search_path='' as $$ select private.record_suhas_game_tournament_result(p_match_id,p_winner_id); $$;
revoke all on function public.start_suhas_game_tournament(uuid) from public,anon;
revoke all on function public.record_suhas_game_tournament_result(uuid,uuid) from public,anon;
grant execute on function public.start_suhas_game_tournament(uuid) to authenticated;
grant execute on function public.record_suhas_game_tournament_result(uuid,uuid) to authenticated;
