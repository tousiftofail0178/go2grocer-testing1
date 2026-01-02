-- Migration: Update manager_applications for flexible linking
-- Date: 2025-12-29
-- Purpose: Support manager requests for both pending business applications and existing businesses

-- 1. Add linked_application_id column (for Step 3 registration)
ALTER TABLE manager_applications 
ADD COLUMN IF NOT EXISTS linked_application_id BIGINT;

-- 2. Make business_id nullable (required for Step 3 flow)
ALTER TABLE manager_applications 
ALTER COLUMN business_id DROP NOT NULL;

-- 3. Add foreign key for linked_application_id
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'manager_applications_linked_application_id_fkey'
    ) THEN 
        ALTER TABLE manager_applications 
        ADD CONSTRAINT manager_applications_linked_application_id_fkey 
        FOREIGN KEY (linked_application_id) REFERENCES business_applications(application_id); 
    END IF; 
END $$;

-- 4. Add check constraint to ensure at least one link exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'manager_applications_valid_link_check'
    ) THEN 
        ALTER TABLE manager_applications 
        ADD CONSTRAINT manager_applications_valid_link_check 
        CHECK (
            (business_id IS NOT NULL) OR (linked_application_id IS NOT NULL)
        ); 
    END IF; 
END $$;

-- 5. Add helpful comments
COMMENT ON COLUMN manager_applications.linked_application_id IS 'Links to pending business application during Step 3 registration';
COMMENT ON COLUMN manager_applications.business_id IS 'Links to approved business profile (nullable during Step 3, populated after approval)';

-- 6. Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'manager_applications' 
AND column_name IN ('business_id', 'linked_application_id')
ORDER BY column_name;
