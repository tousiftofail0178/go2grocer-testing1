// Verify database schema - check if columns exist
require('dotenv').config();
const { Client } = require('pg');

async function verifySchema() {
    console.log('🔍 Verifying business_applications table schema...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check all columns in business_applications table
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'business_applications'
            ORDER BY ordinal_position
        `);

        console.log('\n📊 Current columns in business_applications table:');
        console.table(result.rows);

        // Check for specific columns
        const columnNames = result.rows.map(r => r.column_name);
        const requiredColumns = ['rejection_reason', 'reviewed_at', 'reviewed_by', 'resubmitted_at'];

        console.log('\n✅ Checking required columns:');
        requiredColumns.forEach(col => {
            const exists = columnNames.includes(col);
            console.log(`  ${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`);
        });

        // Check if there are any rows
        const countResult = await client.query('SELECT COUNT(*) as count FROM business_applications');
        console.log(`\n📝 Total rows in business_applications: ${countResult.rows[0].count}`);

        // Show sample data
        const sampleData = await client.query('SELECT * FROM business_applications LIMIT 3');
        console.log('\n📋 Sample data:');
        console.table(sampleData.rows);

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

verifySchema()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
