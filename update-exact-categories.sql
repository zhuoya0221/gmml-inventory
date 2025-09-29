-- Update GMML Inventory Database with Exact Categories from Excel
-- Run this in Supabase SQL Editor

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM public.activity_logs;
-- DELETE FROM public.inventory_items;

-- Insert exact data from Study Consumable.xlsx
INSERT INTO public.inventory_items (name, category, current_stock, min_stock, unit, expire_date, status, storage_location, created_by, updated_by) VALUES

-- Studying Consumables Category
('Syringe 5CC', 'Studying Consumables', 25, 5, 'pcs', '2026-08-15', 'In Stock', 'GTR', 'admin', 'admin'),
('Syringe 50ML', 'Studying Consumables', 15, 3, 'pcs', '2026-09-20', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Hp cartridge', 'Studying Consumables', 8, 2, 'pcs', '2025-12-31', 'In Stock', 'GTR', 'admin', 'admin'),
('Coton ball', 'Studying Consumables', 30, 10, 'pack', '2026-06-30', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Plaster', 'Studying Consumables', 20, 5, 'box', '2026-03-15', 'In Stock', 'GTR', 'admin', 'admin'),
('BD needle holder', 'Studying Consumables', 12, 3, 'pcs', '2026-04-20', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Alcohol wipes', 'Studying Consumables', 40, 8, 'pack', '2025-11-30', 'In Stock', 'GTR', 'admin', 'admin'),
('Glove L', 'Studying Consumables', 18, 5, 'box', '2026-07-15', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Glove M', 'Studying Consumables', 22, 6, 'box', '2026-07-15', 'In Stock', 'GTR', 'admin', 'admin'),
('Glove S', 'Studying Consumables', 15, 4, 'box', '2026-07-15', 'Low Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Glove XS', 'Studying Consumables', 8, 3, 'box', '2026-07-15', 'Low Stock', 'GTR', 'admin', 'admin'),
('Under pads', 'Studying Consumables', 25, 8, 'pack', '2026-05-10', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('BD Vacutainer FLASH BACK', 'Studying Consumables', 30, 10, 'pcs', '2026-02-28', 'In Stock', 'GTR', 'admin', 'admin'),
('BD push butterfly', 'Studying Consumables', 20, 5, 'pcs', '2026-03-10', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Alcohol wipes S', 'Studying Consumables', 35, 8, 'pack', '2025-11-30', 'In Stock', 'GTR', 'admin', 'admin'),
('Zymo eye wab', 'Studying Consumables', 15, 5, 'pcs', '2026-01-20', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Zymo stool kits', 'Studying Consumables', 10, 3, 'kit', '2026-04-15', 'In Stock', 'GTR', 'admin', 'admin'),
('Ominigut stool kits', 'Studying Consumables', 12, 3, 'kit', '2026-04-15', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Zymo saliva kits', 'Studying Consumables', 8, 2, 'kit', '2026-03-30', 'In Stock', 'GTR', 'admin', 'admin'),
('Ominigut saliva kits', 'Studying Consumables', 10, 2, 'kit', '2026-03-30', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Feces catcher_zymo', 'Studying Consumables', 15, 5, 'pcs', '2026-05-20', 'In Stock', 'GTR', 'admin', 'admin'),
('Feces catcher_ominigut', 'Studying Consumables', 12, 4, 'pcs', '2026-05-20', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('NUH envelope', 'Studying Consumables', 50, 15, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Padded envelope', 'Studying Consumables', 30, 10, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Sheet protector', 'Studying Consumables', 25, 8, 'pack', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('EDTA', 'Studying Consumables', 5, 2, 'tube', '2026-06-30', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('PLAIN', 'Studying Consumables', 8, 3, 'tube', '2026-07-15', 'In Stock', 'GTR', 'admin', 'admin'),
('HERPAIN TUBE', 'Studying Consumables', 6, 2, 'tube', '2026-08-10', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Blood collection tray', 'Studying Consumables', 10, 3, 'tray', '2026-09-30', 'In Stock', 'GTR', 'admin', 'admin'),
('Cryovial', 'Studying Consumables', 100, 20, 'pcs', '2026-12-31', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Anaerobe systems-Dental transport medium', 'Studying Consumables', 12, 3, 'pcs', '2026-03-20', 'In Stock', 'GTR', 'admin', 'admin'),
('Water irrigation', 'Studying Consumables', 8, 2, 'bottle', '2026-04-25', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Handrub', 'Studying Consumables', 15, 5, 'bottle', '2026-05-30', 'In Stock', 'GTR', 'admin', 'admin'),
('Mucas extractor (reda)', 'Studying Consumables', 6, 2, 'pcs', '2026-06-15', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Endo brush', 'Studying Consumables', 20, 5, 'pcs', '2026-07-20', 'In Stock', 'GTR', 'admin', 'admin'),
('DVD', 'Studying Consumables', 25, 8, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Sterill per prick test', 'Studying Consumables', 30, 10, 'pcs', '2026-08-15', 'In Stock', 'GTR', 'admin', 'admin'),
('2AA battery', 'Studying Consumables', 20, 5, 'pack', '2026-09-20', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('3AAA Battery', 'Studying Consumables', 18, 5, 'pack', '2026-09-20', 'In Stock', 'GTR', 'admin', 'admin'),
('3M MASK', 'Studying Consumables', 50, 15, 'pcs', '2026-10-30', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Normal Mask', 'Studying Consumables', 100, 25, 'pcs', '2026-10-30', 'In Stock', 'GTR', 'admin', 'admin'),
('Biohazed bag', 'Studying Consumables', 25, 8, 'pack', '2026-11-15', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Extension socket', 'Studying Consumables', 8, 2, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Temperature monitor', 'Studying Consumables', 5, 2, 'pcs', '2026-12-31', 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),

-- Stationery Category
('A4 Paper', 'Stationery', 50, 15, 'ream', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Nail puller', 'Stationery', 3, 1, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Ruler', 'Stationery', 10, 3, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Cutter', 'Stationery', 8, 2, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Desk organiser', 'Stationery', 5, 1, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Casio calculator', 'Stationery', 6, 2, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Note Books', 'Stationery', 25, 8, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Arch file (black)', 'Stationery', 15, 5, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('A4 PP Folder', 'Stationery', 30, 10, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Tap dispenser & refilled tape', 'Stationery', 8, 2, 'set', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Hole punch', 'Stationery', 4, 1, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Binderclips', 'Stationery', 20, 5, 'pack', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Jumbo clips', 'Stationery', 12, 3, 'pack', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Board master', 'Stationery', 8, 2, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Board liquid link', 'Stationery', 6, 2, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Pentel pens', 'Stationery', 25, 8, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Xmar stabilo', 'Stationery', 18, 5, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Stapler', 'Stationery', 6, 2, 'pcs', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('B8 stapler', 'Stationery', 4, 1, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('staples_small', 'Stationery', 15, 5, 'box', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Eraser', 'Stationery', 12, 3, 'pcs', NULL, 'In Stock', 'GTR', 'admin', 'admin'),
('Post_it notes', 'Stationery', 20, 6, 'pack', NULL, 'In Stock', 'MD6 LEVEL9', 'admin', 'admin'),
('Making tape', 'Stationery', 10, 3, 'roll', NULL, 'In Stock', 'GTR', 'admin', 'admin');

-- Insert corresponding activity logs
INSERT INTO public.activity_logs (item_name, user_id, user_email, action, changes) VALUES
('Syringe 5CC', 'admin', 'admin@gmml.com', 'created', '{"name": "Syringe 5CC", "category": "Studying Consumables"}'),
('A4 Paper', 'admin', 'admin@gmml.com', 'created', '{"name": "A4 Paper", "category": "Stationery"}'),
('BD Vacutainer FLASH BACK', 'admin', 'admin@gmml.com', 'created', '{"name": "BD Vacutainer FLASH BACK", "category": "Studying Consumables"}'),
('Pentel pens', 'admin', 'admin@gmml.com', 'created', '{"name": "Pentel pens", "category": "Stationery"}');
