-- Add categories and locations management tables
-- Run this in your Supabase SQL Editor

-- Create categories table (only if it doesn't exist)
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null
);

-- Create locations table (only if it doesn't exist)
create table if not exists public.locations (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null
);

-- Enable Row Level Security
alter table public.categories enable row level security;
alter table public.locations enable row level security;

-- Create RLS policies for categories (drop existing ones first to avoid conflicts)
drop policy if exists "Categories are viewable by authenticated users" on public.categories;
drop policy if exists "Categories are manageable by admins only" on public.categories;

create policy "Categories are viewable by authenticated users" on public.categories
  for select using (auth.role() = 'authenticated');

create policy "Categories are manageable by admins only" on public.categories
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create RLS policies for locations (drop existing ones first to avoid conflicts)
drop policy if exists "Locations are viewable by authenticated users" on public.locations;
drop policy if exists "Locations are manageable by admins only" on public.locations;

create policy "Locations are viewable by authenticated users" on public.locations
  for select using (auth.role() = 'authenticated');

create policy "Locations are manageable by admins only" on public.locations
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create indexes (only if they don't exist)
create index if not exists categories_name_idx on public.categories(name);
create index if not exists locations_name_idx on public.locations(name);

-- Insert default categories and locations based on existing data
-- You may want to customize these based on your current inventory
-- Note: Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users table
-- You can find your user ID by running: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- First, let's get the first admin user ID (or you can replace with specific user ID)
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Try to get the first user from profiles table, or use the first user from auth.users
    SELECT id INTO admin_user_id 
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    -- If no admin found, use the first user from auth.users
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id 
        FROM auth.users 
        LIMIT 1;
    END IF;
    
    -- If still no user found, create a placeholder (this should not happen in normal setup)
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found. Please create a user account first.';
    END IF;

    -- Insert categories (matching existing database data)
    INSERT INTO public.categories (name, description, created_by) VALUES
      ('Studying Consumables', 'Items used for research and studying activities', admin_user_id),
      ('Stationery', 'Office supplies and stationery items', admin_user_id),
      ('Others', 'Miscellaneous items that do not fit other categories', admin_user_id)
    ON CONFLICT (name) DO NOTHING; -- Avoid duplicates if running multiple times

    -- Insert locations (matching existing database data)
    INSERT INTO public.locations (name, description, created_by) VALUES
      ('GTR', 'GTR storage location', admin_user_id),
      ('MD6 LEVEL9', 'MD6 Level 9 storage area', admin_user_id)
    ON CONFLICT (name) DO NOTHING; -- Avoid duplicates if running multiple times

    RAISE NOTICE 'Successfully inserted default categories and locations using user ID: %', admin_user_id;
END $$;
