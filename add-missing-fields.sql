-- Add missing fields to existing inventory_items table
-- Run this in your Supabase SQL Editor

-- Add unit column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' 
        AND column_name = 'unit'
    ) THEN
        ALTER TABLE public.inventory_items 
        ADD COLUMN unit text;
        RAISE NOTICE 'Added unit column';
    ELSE
        RAISE NOTICE 'unit column already exists';
    END IF;
END $$;

-- Add expire_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' 
        AND column_name = 'expire_date'
    ) THEN
        ALTER TABLE public.inventory_items 
        ADD COLUMN expire_date date;
        RAISE NOTICE 'Added expire_date column';
    ELSE
        RAISE NOTICE 'expire_date column already exists';
    END IF;
END $$;

-- Add updated_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' 
        AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE public.inventory_items 
        ADD COLUMN updated_by text DEFAULT 'team-user';
        RAISE NOTICE 'Added updated_by column';
    ELSE
        RAISE NOTICE 'updated_by column already exists';
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;
