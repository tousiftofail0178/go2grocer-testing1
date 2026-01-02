-- 1. Add Columns
ALTER TABLE global_catalog 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_group_id INTEGER,
ADD COLUMN IF NOT EXISTS pack_size_label TEXT;

-- 2. Insert Test Data (Fresh Potato Variants)
-- Group ID: 101
INSERT INTO global_catalog (name, sku_barcode, base_unit, base_weight_grams, stock_quantity, base_image_url, cost_price, selling_price, variant_group_id, pack_size_label)
VALUES 
-- Margin OK (12%):
('Fresh Potato - Gol Alu', 'POT-50KG', 'kg', 50000, 450, '/images/potato.jpg', 1100.00, 1250.00, 101, '50kg Sack'),
-- Margin CRITICAL (1.6%):
('Fresh Potato - Gol Alu', 'POT-25KG', 'kg', 25000, 120, '/images/potato.jpg', 590.00, 600.00, 101, '25kg Sack'),
-- Margin GOOD (23%):
('Fresh Potato - Gol Alu', 'POT-05KG', 'kg', 5000, 800, '/images/potato.jpg', 100.00, 130.00, 101, '5kg Mesh')
ON CONFLICT (sku_barcode) DO UPDATE SET 
    cost_price = EXCLUDED.cost_price,
    selling_price = EXCLUDED.selling_price,
    variant_group_id = EXCLUDED.variant_group_id,
    pack_size_label = EXCLUDED.pack_size_label;
