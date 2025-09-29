-- Fix timestamp fields in inventory_items table
-- Run this in your Supabase SQL Editor

-- First, let's check the current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.inventory_items 
        ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.inventory_items 
        ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Update existing records to have proper timestamps
UPDATE public.inventory_items 
SET 
    created_at = COALESCE(created_at, timezone('utc'::text, now())),
    updated_at = COALESCE(updated_at, timezone('utc'::text, now()))
WHERE created_at IS NULL OR updated_at IS NULL;

-- Create a trigger to automatically update updated_at on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;

-- Create the trigger
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;
