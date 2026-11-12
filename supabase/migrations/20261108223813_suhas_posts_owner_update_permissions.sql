-- Allow authenticated members to edit only their own SUHAS-MAX posts.
-- Existing SELECT/INSERT/DELETE grants and policies remain unchanged.
grant update on table public.suhas_posts to authenticated;

drop policy if exists "Members can update own posts" on public.suhas_posts;
create policy "Members can update own posts"
on public.suhas_posts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and audience = any (array['public'::text, 'friends'::text, 'only_me'::text])
);
