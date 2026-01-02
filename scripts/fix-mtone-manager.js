// CRITICAL FIX: Insert missing manager_application for MT One
require('dotenv').config();
const { Client } = require('pg');

async function fixMTOneManager() {
    console.log('🔧 Fixing MT One manager application...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Find MT One business application
        const appResult = await client.query(`
            SELECT application_id, user_id 
            FROM business_applications 
            WHERE business_name = 'MT One' 
            LIMIT 1
        `);

        if (appResult.rows.length === 0) {
            console.log('⚠️ MT One business application not found');
            return;
        }

        const { application_id: mtoneAppId, user_id: mtoneUserId } = appResult.rows[0];
        console.log(`📝 Found MT One: app_id=${mtoneAppId}, user_id=${mtoneUserId}`);

        // Find manager user
        const managerResult = await client.query(`
            SELECT user_id 
            FROM users 
            WHERE email = 'manager@mtone.com' 
            LIMIT 1
        `);

        if (managerResult.rows.length === 0) {
            console.log('⚠️ Manager user (manager@mtone.com) not found');
            return;
        }

        const managerUserId = managerResult.rows[0].user_id;
        console.log(`👤 Found manager user: user_id=${managerUserId}`);

        // Insert manager_application
        await client.query(`
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
            ) VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT DO NOTHING
        `, [
            mtoneUserId,
            mtoneAppId,
            'manager@mtone.com',
            '+8801700000001',
            'Manager',
            'One',
            'pending'
        ]);

        console.log('✅ Manager application inserted successfully!');

        // Verify
        const verifyResult = await client.query(`
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
            WHERE ma.manager_email = 'manager@mtone.com'
        `);

        console.log('\n📊 Verification:');
        console.table(verifyResult.rows);

    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

fixMTOneManager()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
