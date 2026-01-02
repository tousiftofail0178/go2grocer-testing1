// Check manager_applications table for recent entries
require('dotenv').config();
const { Client } = require('pg');

async function checkManagerApplications() {
    console.log('🔍 Checking manager_applications table...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check manager_applications table
        const result = await client.query(`
            SELECT 
                ma.application_id,
                ma.business_owner_id,
                ma.linked_application_id,
                ma.business_id,
                ma.manager_email,
                ma.manager_first_name,
                ma.manager_last_name,
                ma.status,
                ma.applied_at,
                ba.business_name,
                u.email as owner_email
            FROM manager_applications ma
            LEFT JOIN business_applications ba ON ma.linked_application_id = ba.application_id
            LEFT JOIN users u ON ma.business_owner_id = u.user_id
            ORDER BY ma.applied_at DESC
            LIMIT 10
        `);

        console.log('\n📊 Recent Manager Applications:');
        console.table(result.rows);
        console.log(`\nTotal records: ${result.rows.length}`);

        // Also check managerRequests table
        const requestsResult = await client.query(`
            SELECT * FROM manager_requests 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        console.log('\n📊 Manager Requests Table:');
        console.table(requestsResult.rows);
        console.log(`\nTotal records: ${requestsResult.rows.length}`);

    } catch (error) {
        console.error('❌ Query failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

checkManagerApplications()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
