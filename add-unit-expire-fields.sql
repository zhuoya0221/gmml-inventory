-- Add Unit and Expire Date fields to inventory_items table
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
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;
