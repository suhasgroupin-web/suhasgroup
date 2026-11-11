begin;
create table if not exists public.candidate_resumes(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null default 'My Professional CV',
 resume_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.candidate_resumes enable row level security;
drop policy if exists "Members manage own CV drafts" on public.candidate_resumes;
create policy "Members manage own CV drafts" on public.candidate_resumes
for all to authenticated
using((select auth.uid())=user_id)
with check((select auth.uid())=user_id);
grant select,insert,update,delete on public.candidate_resumes to authenticated;
create index if not exists candidate_resumes_user_updated_idx on public.candidate_resumes(user_id,updated_at desc);
notify pgrst,'reload schema';
commit;