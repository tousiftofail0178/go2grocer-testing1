// Manual Database Migration Script
// Run this to apply the missing columns to your database
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

async function runMigration() {
    console.log('🔄 Connecting to database...');

    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);

    try {
        console.log('📝 Adding missing columns to business_applications table...');

        // Add columns
        await client`
            ALTER TABLE business_applications 
            ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
            ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS reviewed_by BIGINT,
            ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP
        `;

        console.log('✅ Columns added successfully!');

        console.log('🔗 Adding foreign key constraint...');

        // Add foreign key
        await client`
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
        `;

        console.log('✅ Constraint added successfully!');

        // Verify
        console.log('🔍 Verifying columns...');
        const result = await client`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'business_applications' 
            AND column_name IN ('rejection_reason', 'reviewed_at', 'reviewed_by', 'resubmitted_at')
            ORDER BY column_name
        `;

        console.log('📊 Columns in database:');
        console.table(result);

        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await client.end();
    }
}

runMigration()
    .then(() => {
        console.log('🎉 All done! Restart your dev server.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to run migration:', error);
        process.exit(1);
    });
