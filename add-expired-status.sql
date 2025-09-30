-- Add "Expired" status to inventory items
-- Run this in your Supabase SQL Editor

-- First, drop the existing check constraint
ALTER TABLE public.inventory_items 
DROP CONSTRAINT IF EXISTS inventory_items_status_check;

-- Add the new check constraint with "Expired" status
ALTER TABLE public.inventory_items 
ADD CONSTRAINT inventory_items_status_check 
CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock', 'Expired'));

-- Create or replace function to automatically update status based on stock and expiration
CREATE OR REPLACE FUNCTION public.update_item_status()
RETURNS trigger as $$
BEGIN
  -- First check if item is expired
  IF NEW.expire_date IS NOT NULL AND NEW.expire_date < CURRENT_DATE THEN
    NEW.status = 'Expired';
  -- Then check stock levels if not expired
  ELSIF NEW.current_stock <= 0 THEN
    NEW.status = 'Out of Stock';
  ELSIF NEW.current_stock <= NEW.min_stock THEN
    NEW.status = 'Low Stock';
  ELSE
    NEW.status = 'In Stock';
  END IF;
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger to automatically update status on insert/update
DROP TRIGGER IF EXISTS trigger_update_item_status ON public.inventory_items;
CREATE TRIGGER trigger_update_item_status
  BEFORE INSERT OR UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_item_status();

-- Update existing items that might be expired
UPDATE public.inventory_items 
SET status = 'Expired'
WHERE expire_date IS NOT NULL 
  AND expire_date < CURRENT_DATE
  AND status != 'Expired';

-- Optional: Create a function to check and update expired items (can be run periodically)
CREATE OR REPLACE FUNCTION public.check_expired_items()
RETURNS void as $$
BEGIN
  UPDATE public.inventory_items 
  SET status = 'Expired', updated_at = NOW()
  WHERE expire_date IS NOT NULL 
    AND expire_date < CURRENT_DATE
    AND status != 'Expired';
END;
$$ language plpgsql;
