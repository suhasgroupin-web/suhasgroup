alter table public.suhas_game_rooms add column if not exists rps_host_choice text, add column if not exists rps_guest_choice text, add column if not exists rps_host_score integer not null default 0, add column if not exists rps_guest_score integer not null default 0, add column if not exists rps_round integer not null default 1, add column if not exists rps_round_winner uuid;
create table if not exists public.suhas_game_room_rounds (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.suhas_game_rooms(id) on delete cascade,
 round_number integer not null,
 host_id uuid not null references auth.users(id) on delete cascade,
 guest_id uuid not null references auth.users(id) on delete cascade,
 host_choice text not null check(host_choice in ('rock','paper','scissors')),
 guest_choice text not null check(guest_choice in ('rock','paper','scissors')),
 winner_id uuid references auth.users(id) on delete set null,
 outcome text not null check(outcome in ('host_win','guest_win','draw')),
 created_at timestamptz not null default now(),
 unique(room_id,round_number)
);
alter table public.suhas_game_room_rounds enable row level security;
grant select on public.suhas_game_room_rounds to authenticated;
drop policy if exists "game round history visible to room players" on public.suhas_game_room_rounds;
create policy "game round history visible to room players" on public.suhas_game_room_rounds for select to authenticated using (private.is_suhas_game_room_member(room_id,(select auth.uid())));
create or replace function private.play_suhas_rps_choice(p_room_id uuid,p_choice text) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_host uuid; v_game text; v_status text; v_members uuid[]; v_guest uuid; v_host_choice text; v_guest_choice text; v_winner uuid; v_outcome text; v_round integer; v_hscore integer; v_gscore integer;
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 if p_choice not in ('rock','paper','scissors') then raise exception 'Invalid choice'; end if;
 select host_id,game_key,status,rps_host_choice,rps_guest_choice,rps_round,rps_host_score,rps_guest_score into v_host,v_game,v_status,v_host_choice,v_guest_choice,v_round,v_hscore,v_gscore from public.suhas_game_rooms where id=p_room_id for update;
 if not found then raise exception 'Room not found'; end if;
 if v_game<>'rock_paper_scissors' or v_status not in ('open','in_progress') then raise exception 'Room is not accepting a choice'; end if;
 if not private.is_suhas_game_room_member(p_room_id,v_user) then raise exception 'Room membership required'; end if;
 select user_id into v_guest from public.suhas_game_room_members where room_id=p_room_id and user_id<>v_host limit 1;
 if v_guest is null then raise exception 'Waiting for the second player'; end if;
 if v_user=v_host then
   if v_host_choice is not null then raise exception 'Your choice is already locked for this round'; end if;
   v_host_choice:=p_choice;
 else
   if v_user<>v_guest then raise exception 'Not a room player'; end if;
   if v_guest_choice is not null then raise exception 'Your choice is already locked for this round'; end if;
   v_guest_choice:=p_choice;
 end if;
 if v_host_choice is not null and v_guest_choice is not null then
   if v_host_choice=v_guest_choice then v_outcome:='draw';
   elsif (v_host_choice='rock' and v_guest_choice='scissors') or (v_host_choice='paper' and v_guest_choice='rock') or (v_host_choice='scissors' and v_guest_choice='paper') then v_outcome:='host_win'; v_winner:=v_host; v_hscore:=v_hscore+1;
   else v_outcome:='guest_win'; v_winner:=v_guest; v_gscore:=v_gscore+1;
   end if;
   insert into public.suhas_game_room_rounds(room_id,round_number,host_id,guest_id,host_choice,guest_choice,winner_id,outcome) values(p_room_id,v_round,v_host,v_guest,v_host_choice,v_guest_choice,v_winner,v_outcome);
 end if;
 update public.suhas_game_rooms set rps_host_choice=v_host_choice,rps_guest_choice=v_guest_choice,rps_host_score=v_hscore,rps_guest_score=v_gscore,rps_round_winner=v_winner,status=case when v_host_choice is not null and v_guest_choice is not null then 'finished' else 'in_progress' end,updated_at=now() where id=p_room_id;
 return jsonb_build_object('round',v_round,'host_choice',v_host_choice,'guest_choice',v_guest_choice,'winner_id',v_winner,'outcome',v_outcome,'host_score',v_hscore,'guest_score',v_gscore);
end; $$;
create or replace function private.rematch_suhas_rps_room(p_room_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_game text; v_status text; v_host uuid;
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 select game_key,status,host_id into v_game,v_status,v_host from public.suhas_game_rooms where id=p_room_id for update;
 if not found or not private.is_suhas_game_room_member(p_room_id,v_user) then raise exception 'Room membership required'; end if;
 if v_game<>'rock_paper_scissors' or v_status<>'finished' then raise exception 'Finish the current round before rematch'; end if;
 update public.suhas_game_rooms set rps_host_choice=null,rps_guest_choice=null,rps_round=rps_round+1,rps_round_winner=null,status='in_progress',updated_at=now() where id=p_room_id;
end; $$;
revoke all on function private.play_suhas_rps_choice(uuid,text),private.rematch_suhas_rps_room(uuid) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.play_suhas_rps_choice(uuid,text),private.rematch_suhas_rps_room(uuid) to authenticated;
create or replace function public.play_suhas_rps_choice(p_room_id uuid,p_choice text) returns jsonb language sql security invoker set search_path='' as $$ select private.play_suhas_rps_choice(p_room_id,p_choice); $$;
create or replace function public.rematch_suhas_rps_room(p_room_id uuid) returns void language sql security invoker set search_path='' as $$ select private.rematch_suhas_rps_room(p_room_id); $$;
revoke all on function public.play_suhas_rps_choice(uuid,text),public.rematch_suhas_rps_room(uuid) from public,anon;
grant execute on function public.play_suhas_rps_choice(uuid,text),public.rematch_suhas_rps_room(uuid) to authenticated;