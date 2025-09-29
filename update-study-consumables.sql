-- Update GMML Inventory Database with Study Consumables
-- Run this in Supabase SQL Editor

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM public.activity_logs;
-- DELETE FROM public.inventory_items;

-- Insert study consumables data with three main categories
INSERT INTO public.inventory_items (name, category, current_stock, min_stock, unit, expire_date, status, storage_location, created_by, updated_by) VALUES

-- Laboratory Supplies Category
('Pipette Tips (10μL)', 'Laboratory Supplies', 25, 5, 'box', '2026-03-15', 'In Stock', 'GTR', 'admin', 'admin'),
('Pipette Tips (200μL)', 'Laboratory Supplies', 18, 8, 'box', '2026-05-20', 'In Stock', 'GTR', 'admin', 'admin'),
('Pipette Tips (1000μL)', 'Laboratory Supplies', 12, 3, 'box', '2026-02-10', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Microcentrifuge Tubes (1.5mL)', 'Laboratory Supplies', 50, 10, 'pack', '2025-12-31', 'In Stock', 'GTR', 'admin', 'admin'),
('Microcentrifuge Tubes (0.5mL)', 'Laboratory Supplies', 30, 8, 'pack', '2026-01-15', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('PCR Tubes', 'Laboratory Supplies', 20, 5, 'strip', '2025-11-30', 'Low Stock', 'GTR', 'admin', 'admin'),
('Gloves (Nitrile)', 'Laboratory Supplies', 15, 5, 'box', '2026-06-30', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Gloves (Latex)', 'Laboratory Supplies', 8, 5, 'box', '2026-04-15', 'Low Stock', 'GTR', 'admin', 'admin'),
('Petri Dishes (90mm)', 'Laboratory Supplies', 40, 10, 'pack', '2025-10-20', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Cell Culture Plates (96-well)', 'Laboratory Supplies', 12, 3, 'pack', '2026-08-15', 'In Stock', 'GTR', 'admin', 'admin'),

-- Research Chemicals Category
('Tris-HCl Buffer (1M)', 'Research Chemicals', 3, 1, 'L', '2025-09-30', 'Low Stock', 'GTR', 'admin', 'admin'),
('EDTA Solution (0.5M)', 'Research Chemicals', 2, 1, 'L', '2026-01-20', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('NaCl (Molecular Biology Grade)', 'Research Chemicals', 5, 2, 'kg', '2026-12-31', 'In Stock', 'GTR', 'admin', 'admin'),
('Agarose Powder', 'Research Chemicals', 2, 1, 'g', '2025-11-15', 'Low Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Ethidium Bromide (10mg/mL)', 'Research Chemicals', 1, 1, 'mL', '2025-08-10', 'Low Stock', 'GTR', 'admin', 'admin'),
('Loading Dye (6x)', 'Research Chemicals', 4, 2, 'mL', '2026-03-30', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('DNA Ladder (1kb)', 'Research Chemicals', 2, 1, 'μL', '2025-12-05', 'Low Stock', 'GTR', 'admin', 'admin'),
('Proteinase K', 'Research Chemicals', 1, 1, 'mg', '2026-02-28', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('RNase A', 'Research Chemicals', 1, 1, 'mg', '2025-10-31', 'Low Stock', 'GTR', 'admin', 'admin'),
('DNase I', 'Research Chemicals', 1, 1, 'units', '2026-04-15', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),

-- Office & Documentation Category
('Lab Notebooks (A4)', 'Office & Documentation', 25, 5, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Permanent Markers (Black)', 'Office & Documentation', 12, 3, 'pcs', '2026-07-20', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Permanent Markers (Blue)', 'Office & Documentation', 8, 3, 'pcs', '2026-07-20', 'In Stock', 'GTR', 'admin', 'admin'),
('Fine Point Pens', 'Office & Documentation', 20, 5, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Stapler & Staples', 'Office & Documentation', 3, 1, 'set', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Binder Clips (Assorted)', 'Office & Documentation', 5, 2, 'pack', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Paper Clips (Box)', 'Office & Documentation', 2, 1, 'box', NULL, 'Low Stock', 'GTR', 'admin', 'admin'),
('File Folders (Manila)', 'Office & Documentation', 15, 5, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Labels (White)', 'Office & Documentation', 10, 3, 'sheet', '2025-11-30', 'In Stock', 'GTR', 'admin', 'admin'),
('Transparent Tape', 'Office & Documentation', 6, 2, 'roll', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin');

-- Insert corresponding activity logs
INSERT INTO public.activity_logs (item_name, user_id, user_email, action, changes) VALUES
('Pipette Tips (10μL)', 'admin', 'admin@gmml.com', 'created', '{"name": "Pipette Tips (10μL)", "category": "Laboratory Supplies"}'),
('Pipette Tips (200μL)', 'admin', 'admin@gmml.com', 'created', '{"name": "Pipette Tips (200μL)", "category": "Laboratory Supplies"}'),
('Tris-HCl Buffer (1M)', 'admin', 'admin@gmml.com', 'created', '{"name": "Tris-HCl Buffer (1M)", "category": "Research Chemicals"}'),
('Lab Notebooks (A4)', 'admin', 'admin@gmml.com', 'created', '{"name": "Lab Notebooks (A4)", "category": "Office & Documentation"}');
