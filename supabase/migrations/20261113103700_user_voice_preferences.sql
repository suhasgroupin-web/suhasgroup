create table if not exists public.user_voice_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  voice_style text not null default 'auto' check (voice_style in ('auto','female','male','young','mature')),
  voice_name text not null default '',
  voice_lang text not null default '',
  speech_lang text not null default 'auto',
  voice_rate numeric not null default 1.08 check (voice_rate between 0.85 and 1.25),
  updated_at timestamptz not null default now()
);
alter table public.user_voice_preferences enable row level security;
create policy "Users can read their own voice preferences" on public.user_voice_preferences for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own voice preferences" on public.user_voice_preferences for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own voice preferences" on public.user_voice_preferences for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
