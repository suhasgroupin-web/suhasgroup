-- Enforce SUHAS-MAX privacy preferences at the database boundary.
-- Existing rows and pages are preserved; only INSERT/SELECT policies are tightened.
drop policy if exists "send own friend requests" on public.suhas_friend_requests;
create policy "send own friend requests" on public.suhas_friend_requests
for insert to authenticated
with check (
 sender_id = (select auth.uid()) and status = 'pending'
 and sender_id <> recipient_id
 and coalesce((select p.allow_friend_requests from public.suhas_account_preferences p where p.user_id=recipient_id),true)=true
);
drop policy if exists "members can send own messages" on public.suhas_messages;
create policy "members can send own messages" on public.suhas_messages
for insert to authenticated
with check (
 sender_id = (select auth.uid())
 and private.is_suhas_conversation_member(conversation_id)
 and not exists (
   select 1
   from public.suhas_conversation_members recipient
   left join public.suhas_account_preferences pref on pref.user_id=recipient.user_id
   where recipient.conversation_id=suhas_messages.conversation_id
     and recipient.user_id<> (select auth.uid())
     and coalesce(pref.allow_messages,'everyone')='nobody'
 )
 and not exists (
   select 1
   from public.suhas_conversation_members recipient
   join public.suhas_account_preferences pref on pref.user_id=recipient.user_id
   where recipient.conversation_id=suhas_messages.conversation_id
     and recipient.user_id<> (select auth.uid())
     and pref.allow_messages='friends'
     and not exists (
       select 1 from public.suhas_friend_requests fr
       where fr.status='accepted'
         and ((fr.sender_id=(select auth.uid()) and fr.recipient_id=recipient.user_id)
           or (fr.recipient_id=(select auth.uid()) and fr.sender_id=recipient.user_id))
     )
 )
);
drop policy if exists "signed in members can discover public profiles" on public.suhas_public_profiles;
create policy "signed in members can discover public profiles" on public.suhas_public_profiles
for select to authenticated
using (
 (profile_complete=true and coalesce((select p.profile_searchable from public.suhas_account_preferences p where p.user_id=suhas_public_profiles.user_id),true)=true)
 or user_id=(select auth.uid())
);
