-- SUHAS-MAX post reporting and moderation queue
create table if not exists public.suhas_post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id bigint not null references public.suhas_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  post_owner_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam','harassment','hate_speech','violence','false_information','impersonation','other')),
  details text not null default '' check (char_length(details) <= 2000),
  status text not null default 'pending' check (status in ('pending','reviewing','actioned','dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  unique (post_id, reporter_id),
  check (reporter_id <> post_owner_id)
);
alter table public.suhas_post_reports enable row level security;
create index if not exists suhas_post_reports_status_created_idx on public.suhas_post_reports(status, created_at desc);
create index if not exists suhas_post_reports_reporter_created_idx on public.suhas_post_reports(reporter_id, created_at desc);
drop policy if exists "Members submit reports for other members posts" on public.suhas_post_reports;
create policy "Members submit reports for other members posts"
on public.suhas_post_reports for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and reporter_id <> post_owner_id
  and exists (select 1 from public.suhas_posts p where p.id = post_id and p.user_id = post_owner_id)
);
drop policy if exists "Members read own post reports" on public.suhas_post_reports;
create policy "Members read own post reports"
on public.suhas_post_reports for select to authenticated
using (reporter_id = (select auth.uid()));
drop policy if exists "Admins review post reports" on public.suhas_post_reports;
create policy "Admins review post reports"
on public.suhas_post_reports for all to authenticated
using (public.has_suhas_role(array['OWNER','ADMIN']::text[]))
with check (public.has_suhas_role(array['OWNER','ADMIN']::text[]));
