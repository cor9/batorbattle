/* COMPLETE PROFILE SYSTEM SETUP */
/* Run this in the Supabase SQL Editor to fix "Profiles Not Saving" issues. */

/* 1. Create Profiles Table (if it doesn't exist) */
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  display_name text,
  avatar_url text,
  website text,

  /* Add new columns directly in creation to be safe */
  social_links jsonb,
  about_me text[],
  age_range text,
  orientation text,

  constraint username_length check (char_length(display_name) >= 3)
);

/* 2. Add Missing Columns (Safe to run if table exists) */
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists social_links jsonb;
alter table public.profiles add column if not exists about_me text[];
alter table public.profiles add column if not exists age_range text;
alter table public.profiles add column if not exists orientation text;
alter table public.profiles add column if not exists updated_at timestamp with time zone;

/* 3. Row Level Security (RLS) */
alter table public.profiles enable row level security;

/* Policy: Public profiles are viewable by everyone */
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

/* Policy: Users can insert their own profile */
drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

/* Policy: Users can update their own profile */
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

/* 4. Storage Bucket Setup (for Avatars) */
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

/* Storage Policies */
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select using ( bucket_id = 'avatars' );

drop policy if exists "Anyone can upload an avatar." on storage.objects;
create policy "Anyone can upload an avatar."
  on storage.objects for insert with check ( bucket_id = 'avatars' );

drop policy if exists "Anyone can update their own avatar." on storage.objects;
create policy "Anyone can update their own avatar."
  on storage.objects for update using ( bucket_id = 'avatars' );
