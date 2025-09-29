-- Quick setup for GMML Inventory (run this in Supabase SQL Editor)

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
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
  created_by text not null default 'team-user',
  updated_by text not null default 'team-user'
);

-- Create activity_logs table  
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.inventory_items(id) on delete cascade,
  user_id text not null,
  user_email text not null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  changes jsonb,
  item_name text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security but allow all operations for team use
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for team access
CREATE POLICY "Allow all operations on inventory_items" ON public.inventory_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on activity_logs" ON public.activity_logs  
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data
INSERT INTO public.inventory_items (name, category, current_stock, min_stock, status, storage_location, created_by, updated_by) VALUES
('Laptop Dell XPS', 'Electronics', 5, 2, 'In Stock', 'Office A', 'admin', 'admin'),
('Wireless Mouse', 'Electronics', 1, 3, 'Low Stock', 'Office B', 'admin', 'admin'),
('Office Chair', 'Furniture', 0, 1, 'Out of Stock', 'Storage Room', 'admin', 'admin');
