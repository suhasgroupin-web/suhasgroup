begin;
drop policy if exists "SUHAS owner read member profiles for recruitment" on public.suhas_member_profiles;
create policy "SUHAS owner read member profiles for recruitment"
on public.suhas_member_profiles
for select to authenticated
using (public.has_suhas_role(array['OWNER']));
notify pgrst,'reload schema';
commit;