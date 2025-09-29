-- Reset and setup GMML Inventory Database
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (be careful - this will delete all data!)
DROP TABLE IF EXISTS public.activity_logs;
DROP TABLE IF EXISTS public.inventory_items;

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  photo_url text,
  category text not null,
  current_stock integer not null default 0,
  min_stock integer not null default 0,
  unit text,
  expire_date date,
  status text not null default 'Out of Stock' check (status in ('In Stock', 'Low Stock', 'Out of Stock')),
  storage_location text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by text not null default 'team-user',
  updated_by text not null default 'team-user'
);

-- Create activity_logs table  
CREATE TABLE public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.inventory_items(id) on delete cascade,
  user_id text not null,
  user_email text not null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  changes jsonb,
  item_name text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for team access
CREATE POLICY "Allow all operations on inventory_items" ON public.inventory_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on activity_logs" ON public.activity_logs  
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data with proper values
INSERT INTO public.inventory_items (name, category, current_stock, min_stock, unit, expire_date, status, storage_location, created_by, updated_by) VALUES
('Laptop Dell XPS', 'Electronics', 5, 2, 'pcs', '2025-12-31', 'In Stock', 'GTR', 'admin', 'admin'),
('Wireless Mouse', 'Electronics', 1, 3, 'pcs', NULL, 'Low Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Office Chair', 'Furniture', 0, 1, 'pcs', NULL, 'Out of Stock', 'GTR', 'admin', 'admin'),
('Whiteboard Markers', 'Office Supplies', 8, 5, 'set', '2025-06-30', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Network Cable', 'Electronics', 2, 5, 'm', NULL, 'Low Stock', 'GTR', 'admin', 'admin');

-- Insert sample activity logs
INSERT INTO public.activity_logs (item_name, user_id, user_email, action, changes) VALUES
('Laptop Dell XPS', 'admin', 'admin@gmml.com', 'created', '{"name": "Laptop Dell XPS", "category": "Electronics"}'),
('Wireless Mouse', 'admin', 'admin@gmml.com', 'created', '{"name": "Wireless Mouse", "category": "Electronics"}'),
('Office Chair', 'admin', 'admin@gmml.com', 'created', '{"name": "Office Chair", "category": "Furniture"}');
