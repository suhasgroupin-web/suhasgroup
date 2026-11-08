-- SUHAS-MAX post audience controls.
-- Existing posts remain public to preserve current sharing behavior.
alter table public.suhas_posts
  add column if not exists audience text not null default 'public'
  check (audience in ('public','friends','only_me'));

create index if not exists suhas_posts_audience_created_idx
  on public.suhas_posts (audience, created_at desc);

drop policy if exists "Signed-in members can read posts" on public.suhas_posts;
drop policy if exists "Members can read posts by audience" on public.suhas_posts;

create policy "Members can read posts by audience"
on public.suhas_posts for select to authenticated
using (
  user_id = (select auth.uid())
  or audience = 'public'
  or (
    audience = 'friends'
    and exists (
      select 1 from public.suhas_friend_requests fr
      where fr.status = 'accepted'
        and (
          (fr.sender_id = suhas_posts.user_id and fr.recipient_id = (select auth.uid()))
          or
          (fr.recipient_id = suhas_posts.user_id and fr.sender_id = (select auth.uid()))
        )
    )
  )
);

drop policy if exists "Members can publish own posts" on public.suhas_posts;
create policy "Members can publish own posts"
on public.suhas_posts for insert to authenticated
with check (
  user_id = (select auth.uid())
  and audience in ('public','friends','only_me')
);
