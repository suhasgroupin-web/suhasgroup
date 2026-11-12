-- SUHAS GROUP jobs v2: unique job codes, richer job fields, draft/publish workflow,
-- application status tracking and server-side duplicate-link protection.
-- Already applied to the live project on 2026-11-04. Additive and idempotent.

create sequence if not exists public.jobs_code_seq start 1001;

alter table public.jobs
  add column if not exists job_code text,
  add column if not exists country text,
  add column if not exists salary text,
  add column if not exists experience text,
  add column if not exists requirements text,
  add column if not exists featured boolean not null default false,
  add column if not exists urgent boolean not null default false,
  add column if not exists status text not null default 'published',
  add column if not exists published_at timestamptz;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'jobs_status_check') then
    alter table public.jobs add constraint jobs_status_check check (status in ('draft','published','closed'));
  end if;
end $$;

create or replace function public.jobs_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.job_code is null or new.job_code = '' then
    new.job_code := 'SG-' || to_char(now() at time zone 'utc', 'YY') || '-' || nextval('public.jobs_code_seq');
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;
revoke all on function public.jobs_before_write() from public, anon, authenticated;

drop trigger if exists jobs_before_write on public.jobs;
create trigger jobs_before_write before insert or update on public.jobs
for each row execute function public.jobs_before_write();

update public.jobs set published_at = created_at where published_at is null and status = 'published';
update public.jobs set job_code = null where job_code is null;

create unique index if not exists jobs_job_code_key on public.jobs (job_code);
create unique index if not exists jobs_external_url_key on public.jobs (lower(external_url))
  where external_url is not null and external_url <> '';

drop policy if exists "jobs public read" on public.jobs;
create policy "jobs public read" on public.jobs
  for select to public
  using (status = 'published' or public.is_editor());

alter table public.applications add column if not exists status text not null default 'new';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'applications_status_check') then
    alter table public.applications add constraint applications_status_check
      check (status in ('new','reviewing','shortlisted','rejected','hired'));
  end if;
end $$;

drop policy if exists "Admin update applications" on public.applications;
create policy "Admin update applications" on public.applications
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "own applications insert" on public.applications;
create policy "own applications insert" on public.applications
  for insert to public
  with check (
    auth.uid() = user_id
    and status = 'new'
    and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'published')
  );
