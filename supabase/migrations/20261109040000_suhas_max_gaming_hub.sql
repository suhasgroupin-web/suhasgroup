create table if not exists public.suhas_game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  game_key text not null check (game_key in ('tic_tac_toe', 'rock_paper_scissors')),
  wins integer not null default 0 check (wins >= 0 and wins <= 1000000),
  losses integer not null default 0 check (losses >= 0 and losses <= 1000000),
  draws integer not null default 0 check (draws >= 0 and draws <= 1000000),
  updated_at timestamptz not null default now(),
  unique (user_id, game_key)
);
alter table public.suhas_game_scores enable row level security;
create policy "Members read own game scores" on public.suhas_game_scores for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members create own game scores" on public.suhas_game_scores for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Members update own game scores" on public.suhas_game_scores for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.suhas_game_scores to authenticated;
create index if not exists suhas_game_scores_user_idx on public.suhas_game_scores(user_id);