-- Additive public profile details for the SUHAS-MAX member profile viewer.
-- Existing member data and rows are preserved.
alter table public.suhas_public_profiles
  add column if not exists bio text,
  add column if not exists school text,
  add column if not exists college text,
  add column if not exists university text,
  add column if not exists major text,
  add column if not exists education_level text,
  add column if not exists graduation_year integer,
  add column if not exists study_status text,
  add column if not exists linkedin_url text;

update public.suhas_public_profiles p
set bio=m.bio,
    school=m.school,
    college=m.college,
    university=m.university,
    major=m.major,
    education_level=m.education_level,
    graduation_year=m.graduation_year,
    study_status=m.study_status,
    linkedin_url=m.linkedin_url
from public.suhas_member_profiles m
where p.user_id=m.user_id
  and p.profile_complete=true
  and m.profile_complete=true;
