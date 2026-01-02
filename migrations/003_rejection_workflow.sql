-- Migration: Add resubmission tracking to business_applications
-- Date: 2025-12-27
-- Purpose: Enable rejection workflow with resubmission capability

-- Add resubmitted_at column to track when business owners fix and resubmit rejected applications
ALTER TABLE business_applications 
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP;

-- Add helpful comments
COMMENT ON COLUMN business_applications.rejection_reason IS 'Admin feedback explaining why application was rejected';
COMMENT ON COLUMN business_applications.resubmitted_at IS 'Timestamp when business owner resubmitted after rejection';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'business_applications' 
AND column_name IN ('rejection_reason', 'resubmitted_at');
