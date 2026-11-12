-- SUHAS-MAX live multiplayer Tic-Tac-Toe (additive)
alter table public.suhas_game_rooms add column if not exists game_board text[] not null default array['','','','','','','','',''], add column if not exists current_turn uuid, add column if not exists winner_id uuid, add column if not exists winning_mark text, add column if not exists turn_number integer not null default 0;
create or replace function private.is_suhas_game_room_member(p_room_id uuid,p_user_id uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.suhas_game_room_members m where m.room_id=p_room_id and m.user_id=p_user_id); $$;
revoke all on function private.is_suhas_game_room_member(uuid,uuid) from public,anon; grant execute on function private.is_suhas_game_room_member(uuid,uuid) to authenticated;
drop policy if exists "game rooms visible to authenticated members" on public.suhas_game_rooms;
create policy "game rooms visible to authenticated members" on public.suhas_game_rooms for select to authenticated using (status='open' or host_id=(select auth.uid()) or private.is_suhas_game_room_member(id,(select auth.uid())));
drop policy if exists "room members visible to room participants" on public.suhas_game_room_members;
create policy "room members visible to room participants" on public.suhas_game_room_members for select to authenticated using (user_id=(select auth.uid()) or private.is_suhas_game_room_member(room_id,(select auth.uid())));
create or replace function private.start_suhas_ttt_room(p_room_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_host uuid; v_game text; v_status text; v_count integer;
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 select host_id,game_key,status into v_host,v_game,v_status from public.suhas_game_rooms where id=p_room_id for update;
 if not found then raise exception 'Room not found'; end if;
 if not private.is_suhas_game_room_member(p_room_id,v_user) then raise exception 'Room membership required'; end if;
 if v_game<>'tic_tac_toe' then raise exception 'Live play is currently available for Tic-Tac-Toe only'; end if;
 if v_status='in_progress' then return; end if;
 if v_status<>'open' then raise exception 'Room cannot be started'; end if;
 select count(*) into v_count from public.suhas_game_room_members where room_id=p_room_id;
 if v_count<>2 then raise exception 'Waiting for the second player'; end if;
 update public.suhas_game_rooms set status='in_progress',game_board=array['','','','','','','','',''],current_turn=v_host,winner_id=null,winning_mark=null,turn_number=0,updated_at=now() where id=p_room_id;
end; $$;
create or replace function private.play_suhas_ttt_move(p_room_id uuid,p_cell integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_host uuid; v_game text; v_status text; v_turn uuid; v_board text[]; v_mark text; v_winner text; v_winner_id uuid; v_count integer; v_line integer[];
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 if p_cell<0 or p_cell>8 then raise exception 'Invalid square'; end if;
 select host_id,game_key,status,current_turn,game_board into v_host,v_game,v_status,v_turn,v_board from public.suhas_game_rooms where id=p_room_id for update;
 if not found then raise exception 'Room not found'; end if;
 if not private.is_suhas_game_room_member(p_room_id,v_user) then raise exception 'Room membership required'; end if;
 if v_game<>'tic_tac_toe' then raise exception 'This room is not Tic-Tac-Toe'; end if;
 if v_status<>'in_progress' then raise exception 'Game is not in progress'; end if;
 if v_turn<>v_user then raise exception 'It is not your turn'; end if;
 if coalesce(v_board[p_cell+1],'')<>'' then raise exception 'That square is already occupied'; end if;
 v_mark:=case when v_user=v_host then 'X' else 'O' end; v_board[p_cell+1]:=v_mark;
 foreach v_line slice 1 in array array[[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]] loop
  if v_board[v_line[1]]=v_mark and v_board[v_line[2]]=v_mark and v_board[v_line[3]]=v_mark then v_winner:=v_mark; exit; end if;
 end loop;
 if v_winner is not null then v_winner_id:=v_user; end if;
 select count(*) into v_count from unnest(v_board) as x where x='';
 update public.suhas_game_rooms set game_board=v_board,current_turn=case when v_winner is null and v_count>0 then (select user_id from public.suhas_game_room_members where room_id=p_room_id and user_id<>v_user limit 1) else null end,winner_id=v_winner_id,winning_mark=v_winner,status=case when v_winner is not null or v_count=0 then 'finished' else 'in_progress' end,turn_number=turn_number+1,updated_at=now() where id=p_room_id;
 return jsonb_build_object('board',to_jsonb(v_board),'winner_id',v_winner_id,'winning_mark',v_winner,'draw',v_winner is null and v_count=0,'current_turn',case when v_winner is null and v_count>0 then (select user_id from public.suhas_game_room_members where room_id=p_room_id and user_id<>v_user limit 1) else null end);
end; $$;
revoke all on function private.start_suhas_ttt_room(uuid) from public,anon; revoke all on function private.play_suhas_ttt_move(uuid,integer) from public,anon; grant usage on schema private to authenticated; grant execute on function private.start_suhas_ttt_room(uuid),private.play_suhas_ttt_move(uuid,integer) to authenticated;
create or replace function public.start_suhas_ttt_room(p_room_id uuid) returns void language sql security invoker set search_path='' as $$ select private.start_suhas_ttt_room(p_room_id); $$;
create or replace function public.play_suhas_ttt_move(p_room_id uuid,p_cell integer) returns jsonb language sql security invoker set search_path='' as $$ select private.play_suhas_ttt_move(p_room_id,p_cell); $$;
revoke all on function public.start_suhas_ttt_room(uuid) from public,anon; revoke all on function public.play_suhas_ttt_move(uuid,integer) from public,anon; grant execute on function public.start_suhas_ttt_room(uuid),public.play_suhas_ttt_move(uuid,integer) to authenticated;
do $$ begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='suhas_game_rooms') then alter publication supabase_realtime add table public.suhas_game_rooms; end if; end $$;
