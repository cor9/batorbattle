-- SAFE SETUP SCRIPT (Run this if tables already exist)

-- 1. Ensure Columns Exist in Profiles Table
-- This adds functionality like photos and social links if your table was basic
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists social_links jsonb;
alter table public.profiles add column if not exists about_me text[];
alter table public.profiles add column if not exists age_range text;
alter table public.profiles add column if not exists orientation text;

-- 2. Setup Storage Bucket (Silent if already exists)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 3. Reset Storage Policies (Ensures uploads work)
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select using ( bucket_id = 'avatars' );

drop policy if exists "Anyone can upload an avatar." on storage.objects;
create policy "Anyone can upload an avatar."
  on storage.objects for insert with check ( bucket_id = 'avatars' );

-- 4. Enable RLS on Profiles (Just in case)
alter table public.profiles enable row level security;
