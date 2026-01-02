// Run manager_applications flexible linking migration
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
    console.log('🔄 Running manager_applications flexible linking migration...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read the migration SQL file
        const migrationSQL = fs.readFileSync(
            'migrations/005_manager_applications_flexible_linking.sql',
            'utf8'
        );

        console.log('📝 Executing migration...');
        await client.query(migrationSQL);

        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
