-- Insert default categories and locations only (assumes tables already exist)
-- Run this if you already have the categories and locations tables created
-- This script only inserts the default data to match your existing inventory

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
