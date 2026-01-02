// Quick debug script to check manager data
require('dotenv').config();
const { Client } = require('pg');

async function debugManagers() {
    console.log('🔍 Debugging manager visibility for User ID: 75');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // 1. Check manager_applications
        console.log('📋 Manager Applications (business_owner_id = 75):');
        const mgrs = await client.query(`
            SELECT 
                application_id,
                business_owner_id,
                linked_application_id,
                business_id,
                manager_first_name,
                manager_last_name,
                manager_email,
                status
            FROM manager_applications
            WHERE business_owner_id = 75
        `);
        console.table(mgrs.rows);

        // 2. Check what the API should return
        console.log('\n🔍 Simulating API response:');
        if (mgrs.rows.length > 0) {
            const apiResponse = mgrs.rows.map(row => ({
                source: 'application',
                firstName: row.manager_first_name,
                lastName: row.manager_last_name,
                email: row.manager_email,
                phoneNumber: row.manager_phone || 'N/A',
                status: row.status,
                businessName: 'Pending Business',
            }));
            console.table(apiResponse);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

debugManagers();
