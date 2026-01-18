# Supabase Setup Guide

To enable persistent profiles and authentication (removing the need for local storage), you need to set up a Supabase project.

## Step 1: Create Supabase Project
1. Go to [database.new](https://database.new) and sign in.
2. Create a new project:
   - **Name:** `bator-battle-db`
   - **Region:** Choose one close to your users (e.g., US West)
   - **Password:** Generate a strong password and save it.
3. Wait for the database to provision (~1-2 mins).

## Step 2: Get Credentials
1. Once ready, go to **Project Settings** (cog icon) -> **API**.
2. Find **Project URL** and **Project API keys**.
3. You need two values:
   - **URL**: (e.g., `https://xyz.supabase.co`)
   - **anon public key**: (starts with `ey...`)

## Step 3: Configure Database Tables
Go to the **SQL Editor** (sidebar) and run this query to set up your tables:

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  display_name text,
  avatar_url text,
  age_range text,
  orientation text,
  about_me text[],
  social_links jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Set up Storage for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
```

## Step 4: Add Environment Variables
You need to add these keys to your project.

### Local Development (.env)
Add these lines to your `.env` file:
```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
```

### Production (Netlify/AWS)
Add the same variables to your Netlify and AWS App Runner environment settings.
