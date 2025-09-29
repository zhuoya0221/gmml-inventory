-- Update activity_logs RLS policies to allow admin deletion
-- Run this in your Supabase SQL Editor

-- Drop existing policies for activity_logs
DROP POLICY IF EXISTS "Activity logs are viewable by authenticated users" ON public.activity_logs;
DROP POLICY IF EXISTS "Activity logs are insertable by authenticated users" ON public.activity_logs;

-- Recreate policies with admin deletion capability
-- Allow all authenticated users to view activity logs
CREATE POLICY "Activity logs are viewable by authenticated users" ON public.activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to insert activity logs
CREATE POLICY "Activity logs are insertable by authenticated users" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only admins to delete activity logs
CREATE POLICY "Activity logs are deletable by admins only" ON public.activity_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'activity_logs';
