-- Keep each player's private Gaming Hub totals in sync with completed RPS rounds.
create or replace function private.record_suhas_rps_game_scores()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if new.outcome='draw' then
  insert into public.suhas_game_scores(user_id,game_key,wins,losses,draws,updated_at)
  values(new.host_id,'rock_paper_scissors',0,0,1,now())
  on conflict(user_id,game_key) do update set draws=public.suhas_game_scores.draws+1,updated_at=now();
  insert into public.suhas_game_scores(user_id,game_key,wins,losses,draws,updated_at)
  values(new.guest_id,'rock_paper_scissors',0,0,1,now())
  on conflict(user_id,game_key) do update set draws=public.suhas_game_scores.draws+1,updated_at=now();
 elsif new.outcome='host_win' then
  insert into public.suhas_game_scores(user_id,game_key,wins,losses,draws,updated_at)
  values(new.host_id,'rock_paper_scissors',1,0,0,now())
  on conflict(user_id,game_key) do update set wins=public.suhas_game_scores.wins+1,updated_at=now();
  insert into public.suhas_game_scores(user_id,game_key,wins,losses,draws,updated_at)
  values(new.guest_id,'rock_paper_scissors',0,1,0,now())
  on conflict(user_id,game_key) do update set losses=public.suhas_game_scores.losses+1,updated_at=now();
 else
  insert into public.suhas_game_scores(user_id,game_key,wins,losses,draws,updated_at)
  values(new.host_id,'rock_paper_scissors',0,1,0,now())
  on conflict(user_id,game_key) do update set losses=public.suhas_game_scores.losses+1,updated_at=now();
  insert into public.suhas_game_scores(user_id,game_key,wins,losses,draws,updated_at)
  values(new.guest_id,'rock_paper_scissors',1,0,0,now())
  on conflict(user_id,game_key) do update set wins=public.suhas_game_scores.wins+1,updated_at=now();
 end if;
 return new;
end;
$$;
revoke all on function private.record_suhas_rps_game_scores() from public,anon,authenticated;
drop trigger if exists trg_suhas_rps_round_score_sync on public.suhas_game_room_rounds;
create trigger trg_suhas_rps_round_score_sync after insert on public.suhas_game_room_rounds for each row execute function private.record_suhas_rps_game_scores();
