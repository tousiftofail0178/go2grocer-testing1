-- Manual Database Schema Fix
-- Purpose: Add missing rejection workflow columns to business_applications table
-- Run this directly on your PostgreSQL database

-- Add missing columns
ALTER TABLE business_applications 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewed_by BIGINT,
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP;

-- Add foreign key constraint for reviewed_by
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'business_applications_reviewed_by_fkey'
    ) THEN 
        ALTER TABLE business_applications 
        ADD CONSTRAINT business_applications_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES users(user_id); 
    END IF; 
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'business_applications' 
AND column_name IN ('rejection_reason', 'reviewed_at', 'reviewed_by', 'resubmitted_at')
ORDER BY column_name;

-- Show success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Migration completed successfully. Columns added to business_applications table.';
END $$;
