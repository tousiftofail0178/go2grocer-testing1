-- Migration: Schema Cleanup - Remove Redundant Fields
-- Date: 2025-12-26
-- Purpose: Simplify database by removing publicId, phoneCountryCode, and profileId

-- ============================================
-- BACKUP REMINDER
-- ============================================
-- Run this before executing migration:
-- pg_dump go2grocer > backup_20251226_schema_cleanup.sql

-- ============================================
-- STEP 1: Update phone numbers to include country code
-- ============================================
BEGIN;

-- Combine phone_country_code with phone_number
UPDATE users 
SET phone_number = COALESCE(phone_country_code, '+880') || phone_number
WHERE phone_country_code IS NOT NULL 
  AND phone_number NOT LIKE '+%';

COMMIT;

-- ============================================
-- STEP 2: Remove public_id from users table
-- ============================================
BEGIN;

-- Drop the unique constraint first
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_public_id_key;

-- Drop the column
ALTER TABLE users DROP COLUMN IF EXISTS public_id;

COMMIT;

-- ============================================
-- STEP 3: Remove phone_country_code from users table
-- ============================================
BEGIN;

ALTER TABLE users DROP COLUMN IF EXISTS phone_country_code;

COMMIT;

-- ============================================
-- STEP 4: Restructure profiles_customer primary key
-- ============================================
BEGIN;

-- Drop foreign key constraints that reference profile_id
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_created_by_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;

-- Drop existing primary key on profiles_customer
ALTER TABLE profiles_customer DROP CONSTRAINT IF EXISTS profiles_customer_pkey;

-- Set user_id as new primary key
ALTER TABLE profiles_customer ADD PRIMARY KEY (user_id);

-- Drop the now-redundant profile_id column
ALTER TABLE profiles_customer DROP COLUMN IF EXISTS profile_id;

-- Recreate foreign key constraints to reference user_id
ALTER TABLE orders 
  ADD CONSTRAINT orders_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES profiles_customer(user_id);

ALTER TABLE orders 
  ADD CONSTRAINT orders_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles_customer(user_id);

ALTER TABLE invoices 
  ADD CONSTRAINT invoices_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES profiles_customer(user_id);

COMMIT;

-- ============================================
-- STEP 5: Make optional fields nullable
-- ============================================
BEGIN;

-- Remove NOT NULL constraints from optional fields
ALTER TABLE profiles_customer 
  ALTER COLUMN date_of_birth DROP NOT NULL;

ALTER TABLE profiles_customer 
  ALTER COLUMN nid_passport_number DROP NOT NULL;

ALTER TABLE profiles_customer 
  ALTER COLUMN nid_passport_image_url DROP NOT NULL;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify migration success:

-- 1. Check users table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users';

-- 2. Check profiles_customer structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles_customer';

-- 3. Check phone numbers are formatted correctly
-- SELECT user_id, phone_number FROM users LIMIT 10;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- Restore from backup:
-- psql go2grocer < backup_20251226_schema_cleanup.sql
