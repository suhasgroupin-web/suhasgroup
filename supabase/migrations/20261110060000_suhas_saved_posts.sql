create table if not exists public.suhas_saved_posts (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id bigint not null references public.suhas_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.suhas_saved_posts enable row level security;
grant select, insert, delete on public.suhas_saved_posts to authenticated;

create policy "Members read their own saved posts"
on public.suhas_saved_posts for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Members save posts they can access"
on public.suhas_saved_posts for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.suhas_posts p
    where p.id = suhas_saved_posts.post_id
  )
);

create policy "Members remove their own saved posts"
on public.suhas_saved_posts for delete
to authenticated
using ((select auth.uid()) = user_id);
