// Quick database schema fix script
// Run with: node scripts/run-migration.js

require('dotenv').config();
const { Client } = require('pg');

async function runMigration() {
    console.log('🔄 Connecting to database...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        console.log('📝 Adding missing columns...');

        await client.query(`
            ALTER TABLE business_applications 
            ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
            ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS reviewed_by BIGINT,
            ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP
        `);

        console.log('✅ Columns added successfully!');

        console.log('🔗 Adding foreign key constraint...');

        await client.query(`
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
            END $$
        `);

        console.log('✅ Constraint added successfully!');

        console.log('🔍 Verifying columns...');
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'business_applications' 
            AND column_name IN ('rejection_reason', 'reviewed_at', 'reviewed_by', 'resubmitted_at')
            ORDER BY column_name
        `);

        console.log('📊 Columns in database:');
        console.table(result.rows);

        console.log('\n🎉 Migration completed successfully!');
        console.log('👉 Next step: Restart your dev server with Ctrl+C then npm run dev');

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
