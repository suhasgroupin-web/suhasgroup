-- Candidate contact email on the profile so admins can reach applicants.
-- Already applied to the live project on 2026-11-04.
alter table public.profiles add column if not exists email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;
