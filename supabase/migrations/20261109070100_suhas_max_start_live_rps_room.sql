create or replace function private.start_suhas_rps_room(p_room_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_host uuid; v_game text; v_status text; v_count integer;
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 select host_id,game_key,status into v_host,v_game,v_status from public.suhas_game_rooms where id=p_room_id for update;
 if not found or not private.is_suhas_game_room_member(p_room_id,v_user) then raise exception 'Room membership required'; end if;
 if v_game<>'rock_paper_scissors' then raise exception 'Not a Rock Paper Scissors room'; end if;
 if v_status='in_progress' then return; end if;
 if v_status<>'open' then raise exception 'Room cannot be started'; end if;
 select count(*) into v_count from public.suhas_game_room_members where room_id=p_room_id;
 if v_count<>2 then raise exception 'Waiting for the second player'; end if;
 update public.suhas_game_rooms set status='in_progress',updated_at=now() where id=p_room_id;
end; $$;
revoke all on function private.start_suhas_rps_room(uuid) from public,anon;
grant execute on function private.start_suhas_rps_room(uuid) to authenticated;
create or replace function public.start_suhas_rps_room(p_room_id uuid) returns void language sql security invoker set search_path='' as $$ select private.start_suhas_rps_room(p_room_id); $$;
revoke all on function public.start_suhas_rps_room(uuid) from public,anon;
grant execute on function public.start_suhas_rps_room(uuid) to authenticated;