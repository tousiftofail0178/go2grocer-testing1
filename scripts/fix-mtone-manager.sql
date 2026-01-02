-- CRITICAL FIX: Manual insert for MT One manager application
-- This unblocks testing of the approval workflow

-- First, find the MT One business application ID and user ID
DO $$
DECLARE
    mtone_app_id BIGINT;
    mtone_user_id BIGINT;
    manager_user_id BIGINT;
BEGIN
    -- Find the MT One business application
    SELECT application_id, user_id 
    INTO mtone_app_id, mtone_user_id
    FROM business_applications 
    WHERE business_name = 'MT One' 
    LIMIT 1;

    -- Find the manager user (manager@mtone.com)
    SELECT user_id 
    INTO manager_user_id 
    FROM users 
    WHERE email = 'manager@mtone.com' 
    LIMIT 1;

    -- Insert the missing manager_application record
    IF mtone_app_id IS NOT NULL AND manager_user_id IS NOT NULL THEN
        INSERT INTO manager_applications (
            business_owner_id,
            linked_application_id,
            business_id,
            manager_email,
            manager_phone,
            manager_first_name,
            manager_last_name,
            status,
            applied_at
        ) VALUES (
            mtone_user_id,  -- business owner ID
            mtone_app_id,   -- link to pending application
            NULL,           -- will be set after approval
            'manager@mtone.com',
            '+8801700000001',
            'Manager',
            'One',
            'pending',
            NOW()
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Successfully created manager_application for MT One (app_id: %, user_id: %)', mtone_app_id, manager_user_id;
    ELSE
        RAISE WARNING 'Could not find MT One application or manager user';
        RAISE NOTICE 'App ID: %, Manager User ID: %', mtone_app_id, manager_user_id;
    END IF;
END $$;

-- Verify the insert
SELECT 
    ma.application_id,
    ma.business_owner_id,
    ma.linked_application_id,
    ma.manager_email,
    ma.status,
    ba.business_name,
    u.email as owner_email
FROM manager_applications ma
LEFT JOIN business_applications ba ON ma.linked_application_id = ba.application_id
LEFT JOIN users u ON ma.business_owner_id = u.user_id
WHERE ma.manager_email = 'manager@mtone.com';
