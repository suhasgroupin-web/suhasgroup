alter table public.suhas_game_tournament_matches add column if not exists game_room_id uuid references public.suhas_game_rooms(id) on delete set null;
create unique index if not exists suhas_tournament_match_game_room_unique on public.suhas_game_tournament_matches(game_room_id) where game_room_id is not null;
create or replace function private.open_suhas_tournament_match_room(p_match_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $$
declare m public.suhas_game_tournament_matches%rowtype; t public.suhas_game_tournaments%rowtype; room_id uuid; room_host uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 select * into m from public.suhas_game_tournament_matches where id=p_match_id for update;
 if not found or m.status<>'pending' then raise exception 'Match is not open'; end if;
 if auth.uid() not in (m.player1_id,m.player2_id) then raise exception 'Only the two competing players can open this room' using errcode='42501'; end if;
 select * into t from public.suhas_game_tournaments where id=m.tournament_id;
 if t.status<>'in_progress' then raise exception 'Tournament is not active'; end if;
 if m.player1_id is null or m.player2_id is null then raise exception 'This is a bye match'; end if;
 if m.game_room_id is not null then return m.game_room_id; end if;
 insert into public.suhas_game_rooms(game_key,host_id,status,max_players)
 values(t.game_key,m.player1_id,'open',2) returning id into room_id;
 insert into public.suhas_game_room_members(room_id,user_id,role) values(room_id,m.player1_id,'host');
 update public.suhas_game_tournament_matches set game_room_id=room_id,updated_at=now() where id=p_match_id;
 return room_id;
end;$$;
revoke all on function private.open_suhas_tournament_match_room(uuid) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.open_suhas_tournament_match_room(uuid) to authenticated;
create or replace function public.open_suhas_tournament_match_room(p_match_id uuid)
returns uuid language sql security invoker set search_path=''
as $$ select private.open_suhas_tournament_match_room(p_match_id); $$;
revoke all on function public.open_suhas_tournament_match_room(uuid) from public,anon;
grant execute on function public.open_suhas_tournament_match_room(uuid) to authenticated;
create or replace function private.record_suhas_game_tournament_result(p_match_id uuid,p_winner_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare m public.suhas_game_tournament_matches%rowtype; t public.suhas_game_tournaments%rowtype; room public.suhas_game_rooms%rowtype; ids uuid[]; total_matches integer; done_matches integer; next_round integer; i integer; next_count integer; verified_winner uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into m from public.suhas_game_tournament_matches where id=p_match_id for update;
 if not found then raise exception 'Match not found'; end if;
 select * into t from public.suhas_game_tournaments where id=m.tournament_id for update;
 if t.created_by<>auth.uid() then raise exception 'Only the organizer can confirm results' using errcode='42501'; end if;
 if m.status<>'pending' or m.game_room_id is null then raise exception 'Complete the linked live match first'; end if;
 select * into room from public.suhas_game_rooms where id=m.game_room_id;
 if room.status<>'finished' then raise exception 'The live match is not finished yet'; end if;
 verified_winner:=case when room.game_key='tic_tac_toe' then room.winner_id else room.rps_round_winner end;
 if verified_winner is null or verified_winner<>p_winner_id then raise exception 'Winner does not match the completed live game'; end if;
 if p_winner_id not in (m.player1_id,m.player2_id) then raise exception 'Winner must be one of the two players'; end if;
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
revoke all on function private.record_suhas_game_tournament_result(uuid,uuid) from public,anon,authenticated;
grant execute on function private.record_suhas_game_tournament_result(uuid,uuid) to authenticated;
