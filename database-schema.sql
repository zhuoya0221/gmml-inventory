-- GMML Inventory Management Database Schema
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
alter default privileges revoke execute on functions from public;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create inventory_items table
create table public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  photo_url text,
  category text not null,
  current_stock integer not null default 0,
  min_stock integer not null default 0,
  status text not null default 'Out of Stock' check (status in ('In Stock', 'Low Stock', 'Out of Stock')),
  storage_location text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null,
  updated_by uuid references auth.users(id) not null
);

-- Create activity_logs table
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.inventory_items(id) on delete cascade,
  user_id uuid references auth.users(id) not null,
  user_email text not null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  changes jsonb,
  item_name text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;
alter table public.activity_logs enable row level security;

-- Create RLS policies

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Inventory items policies (all authenticated users can access)
create policy "Inventory items are viewable by authenticated users" on public.inventory_items
  for select using (auth.role() = 'authenticated');

create policy "Inventory items are insertable by authenticated users" on public.inventory_items
  for insert with check (auth.role() = 'authenticated');

create policy "Inventory items are updatable by authenticated users" on public.inventory_items
  for update using (auth.role() = 'authenticated');

create policy "Inventory items are deletable by authenticated users" on public.inventory_items
  for delete using (auth.role() = 'authenticated');

-- Activity logs policies (all authenticated users can view)
create policy "Activity logs are viewable by authenticated users" on public.activity_logs
  for select using (auth.role() = 'authenticated');

create policy "Activity logs are insertable by authenticated users" on public.activity_logs
  for insert with check (auth.role() = 'authenticated');

-- Create functions

-- Function to automatically update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Function to automatically update status based on stock
create or replace function public.update_item_status()
returns trigger as $$
begin
  if new.current_stock <= 0 then
    new.status = 'Out of Stock';
  elsif new.current_stock <= new.min_stock then
    new.status = 'Low Stock';
  else
    new.status = 'In Stock';
  end if;
  return new;
end;
$$ language plpgsql;

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers

-- Trigger for updated_at on inventory_items
create trigger handle_updated_at before update on public.inventory_items
  for each row execute procedure public.handle_updated_at();

-- Trigger for status update on inventory_items
create trigger update_item_status before insert or update on public.inventory_items
  for each row execute procedure public.update_item_status();

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes for better performance
create index inventory_items_category_idx on public.inventory_items(category);
create index inventory_items_status_idx on public.inventory_items(status);
create index inventory_items_storage_location_idx on public.inventory_items(storage_location);
create index inventory_items_name_idx on public.inventory_items using gin(to_tsvector('english', name));
create index activity_logs_item_id_idx on public.activity_logs(item_id);
create index activity_logs_timestamp_idx on public.activity_logs(timestamp desc);

-- Insert some sample data (optional)
-- You can uncomment these after setting up authentication

-- INSERT INTO public.inventory_items (name, category, current_stock, min_stock, storage_location, created_by, updated_by) 
-- VALUES 
--   ('Laptop Dell XPS 13', 'Electronics', 5, 2, 'Office Storage Room A', auth.uid(), auth.uid()),
--   ('Office Chair Ergonomic', 'Furniture', 12, 3, 'Warehouse B', auth.uid(), auth.uid()),
--   ('Printer Paper A4', 'Office Supplies', 50, 10, 'Supply Closet', auth.uid(), auth.uid()),
--   ('USB-C Cables', 'Electronics', 2, 5, 'Tech Storage', auth.uid(), auth.uid()),
--   ('Whiteboard Markers', 'Office Supplies', 8, 3, 'Supply Closet', auth.uid(), auth.uid());
