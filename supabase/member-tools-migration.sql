-- SUHAS GROUP member tools: folders, public pages, preferences and support
-- Public avatar bucket with per-user upload folders (5 MB maximum).
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('member-avatars','member-avatars',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Public read member avatars" on storage.objects;
create policy "Public read member avatars" on storage.objects
for select to public using (bucket_id='member-avatars');
drop policy if exists "Members upload own avatar" on storage.objects;
create policy "Members upload own avatar" on storage.objects
for insert to authenticated with check (bucket_id='member-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Members update own avatar" on storage.objects;
create policy "Members update own avatar" on storage.objects
for update to authenticated using (bucket_id='member-avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='member-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Members delete own avatar" on storage.objects;
create policy "Members delete own avatar" on storage.objects
for delete to authenticated using (bucket_id='member-avatars' and (storage.foldername(name))[1]=auth.uid()::text);

-- Run once in Supabase SQL Editor. Safe to re-run.
create extension if not exists pgcrypto;

create table if not exists public.member_folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
alter table public.member_folders enable row level security;
grant select,insert,update,delete on public.member_folders to authenticated;
drop policy if exists "Members manage own folders" on public.member_folders;
create policy "Members manage own folders" on public.member_folders
for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create table if not exists public.member_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,48}$'),
  title text not null check (char_length(title) between 2 and 100),
  bio text not null default '' check (char_length(bio) <= 1000),
  company text not null default '' check (char_length(company) <= 150),
  university text not null default '' check (char_length(university) <= 180),
  website text not null default '' check (char_length(website) <= 250),
  visibility text not null default 'draft' check (visibility in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists member_pages_owner_idx on public.member_pages(owner_id);
create index if not exists member_pages_published_idx on public.member_pages(slug) where visibility='published';
alter table public.member_pages enable row level security;
grant select,insert,update,delete on public.member_pages to anon,authenticated;
drop policy if exists "Public read published member pages" on public.member_pages;
create policy "Public read published member pages" on public.member_pages
for select to anon,authenticated using (visibility='published' or auth.uid()=owner_id);
drop policy if exists "Members create own pages" on public.member_pages;
create policy "Members create own pages" on public.member_pages
for insert to authenticated with check (auth.uid()=owner_id);
drop policy if exists "Members update own pages" on public.member_pages;
create policy "Members update own pages" on public.member_pages
for update to authenticated using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
drop policy if exists "Members delete own pages" on public.member_pages;
create policy "Members delete own pages" on public.member_pages
for delete to authenticated using (auth.uid()=owner_id);

create table if not exists public.member_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.member_settings enable row level security;
grant select,insert,update on public.member_settings to authenticated;
drop policy if exists "Members manage own settings" on public.member_settings;
create policy "Members manage own settings" on public.member_settings
for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

create table if not exists public.member_support_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 10 and 3000),
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  created_at timestamptz not null default now()
);
alter table public.member_support_requests enable row level security;
grant select,insert on public.member_support_requests to authenticated;
drop policy if exists "Members create support requests" on public.member_support_requests;
create policy "Members create support requests" on public.member_support_requests
for insert to authenticated with check (auth.uid()=owner_id);
drop policy if exists "Members read own support requests" on public.member_support_requests;
create policy "Members read own support requests" on public.member_support_requests
for select to authenticated using (auth.uid()=owner_id);

-- KYC status only: never store raw NID/passport images or face templates here.
create table if not exists public.member_verification_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone_verified_at timestamptz,
  kyc_status text not null default 'not_started' check (kyc_status in ('not_started','pending','verified','rejected')),
  kyc_provider text,
  provider_reference text,
  updated_at timestamptz not null default now()
);
alter table public.member_verification_status enable row level security;
grant select on public.member_verification_status to authenticated;
drop policy if exists "Members read own verification status" on public.member_verification_status;
create policy "Members read own verification status" on public.member_verification_status
for select to authenticated using (auth.uid()=user_id);
drop policy if exists "Members create own verification status" on public.member_verification_status;
drop policy if exists "Members update own verification status" on public.member_verification_status;
-- Only a trusted server-side verification provider should write KYC status.

notify pgrst, 'reload schema';
