-- SUHAS-MAX Gaming Leaderboard and Player Statistics
-- Exposes only aggregate game results and searchable public display names.
create or replace function private.get_suhas_gaming_leaderboard(p_game_key text default 'all', p_limit integer default 25)
returns table(rank bigint, player_name text, game_key text, wins integer, losses integer, draws integer, points bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_game_key not in ('all','tic_tac_toe','rock_paper_scissors') then
    raise exception 'Invalid game filter' using errcode = '22023';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 50 then
    raise exception 'Limit must be between 1 and 50' using errcode = '22023';
  end if;
  return query
  with totals as (
    select s.user_id,
           case when p_game_key = 'all' then 'all' else s.game_key end as selected_game,
           sum(s.wins)::integer as total_wins,
           sum(s.losses)::integer as total_losses,
           sum(s.draws)::integer as total_draws,
           (sum(s.wins)::bigint * 3 + sum(s.draws)::bigint) as total_points
    from public.suhas_game_scores s
    where p_game_key = 'all' or s.game_key = p_game_key
    group by s.user_id, case when p_game_key = 'all' then 'all' else s.game_key end
  ), eligible as (
    select t.*, pp.full_name
    from totals t
    join public.suhas_public_profiles pp on pp.user_id = t.user_id and pp.profile_complete = true
    left join public.suhas_account_preferences ap on ap.user_id = t.user_id
    where coalesce(ap.profile_searchable, true) = true
      and nullif(btrim(pp.full_name), '') is not null
  ), ranked as (
    select row_number() over (order by e.total_points desc, e.total_wins desc, e.total_losses asc, e.full_name asc) as player_rank,
           e.full_name, e.selected_game, e.total_wins, e.total_losses, e.total_draws, e.total_points
    from eligible e
  )
  select r.player_rank, r.full_name, r.selected_game, r.total_wins, r.total_losses, r.total_draws, r.total_points
  from ranked r order by r.player_rank limit p_limit;
end;
$$;
revoke all on function private.get_suhas_gaming_leaderboard(text, integer) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.get_suhas_gaming_leaderboard(text, integer) to authenticated;

create or replace function public.get_suhas_gaming_leaderboard(p_game_key text default 'all', p_limit integer default 25)
returns table(rank bigint, player_name text, game_key text, wins integer, losses integer, draws integer, points bigint)
language sql security invoker set search_path = ''
as $$ select * from private.get_suhas_gaming_leaderboard(p_game_key, p_limit); $$;
revoke all on function public.get_suhas_gaming_leaderboard(text, integer) from public, anon;
grant execute on function public.get_suhas_gaming_leaderboard(text, integer) to authenticated;
