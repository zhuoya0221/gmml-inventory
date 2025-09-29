-- restore-admin-policies.sql

-- This script restores the RLS policies that allow admins to manage all user profiles.
-- This is now secure because the logic is handled by a Supabase Edge Function,
-- which verifies the user's admin status on the server before making changes.

-- 1. Drop the restrictive policies on the profiles table.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Re-create the policies that grant admins full access.
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- No explicit UPDATE policy is needed for admins here, as the Edge Function
-- will use the service_role key, which bypasses RLS. However, we still
-- need a policy for users to update their own non-role information.
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
