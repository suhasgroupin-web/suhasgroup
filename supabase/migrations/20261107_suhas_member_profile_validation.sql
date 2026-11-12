-- SUHAS GROUP: enforce completed member profiles in PostgreSQL.
-- A member cannot mark a profile complete unless every required field is present.
-- Incomplete profiles remain editable; owner/admin access continues to follow existing RLS.
begin;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'suhas_member_profile_complete_fields'
      and conrelid = 'public.suhas_member_profiles'::regclass
  ) then
    alter table public.suhas_member_profiles
      add constraint suhas_member_profile_complete_fields
      check (
        profile_complete = false
        or (
          nullif(btrim(full_name), '') is not null
          and nullif(btrim(mobile), '') is not null
          and nullif(btrim(gender), '') is not null
          and dob is not null
          and nullif(btrim(company), '') is not null
          and nullif(btrim(position), '') is not null
          and nullif(btrim(education_level), '') is not null
          and nullif(btrim(major), '') is not null
          and nullif(btrim(university), '') is not null
          and nullif(btrim(study_status), '') is not null
        )
      ) not valid;
  end if;
end
$$;

alter table public.suhas_member_profiles
  validate constraint suhas_member_profile_complete_fields;

commit;
