-- make-static.sql

-- This script modifies your database to work with a purely client-side application.
-- It removes server-only functions and updates security policies for client-side enforcement.

-- 1. Remove server-only helper functions.
-- These functions are no longer needed as we are moving all logic to the client.
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_member_or_admin();

-- 2. Drop all existing policies on the inventory_items table to redefine them.
DROP POLICY IF EXISTS "Allow view for authenticated users" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow modification for admins and members" ON public.inventory_items;

-- 3. Create new RLS policies for a client-side world.
-- Any authenticated user can VIEW the inventory. This remains the same.
CREATE POLICY "Authenticated users can view inventory" ON public.inventory_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users who are 'admin' or 'member' can INSERT new items.
-- This policy checks the user's role by looking it up in the profiles table.
CREATE POLICY "Admins and members can insert inventory" ON public.inventory_items
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'member')
  );

-- Users who are 'admin' or 'member' can UPDATE items.
CREATE POLICY "Admins and members can update inventory" ON public.inventory_items
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'member')
  );

-- Users who are 'admin' or 'member' can DELETE items.
CREATE POLICY "Admins and members can delete inventory" ON public.inventory_items
  FOR DELETE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'member')
  );

-- 4. Clean up policies on the profiles table (remove admin override).
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Note: Management of user roles must now be done directly in your Supabase dashboard,
-- as the secure admin panel has been removed.
