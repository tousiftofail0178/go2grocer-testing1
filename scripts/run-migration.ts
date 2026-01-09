import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
    try {
        // Read database URL from environment
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL not found in environment');
        }

        console.log('🔌 Connecting to database...');
        const sql = neon(databaseUrl);

        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/001_schema_cleanup.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

        console.log('📄 Migration file loaded');
        console.log('🚀 Executing migration...\n');

        // Split by statement (simple split on semicolon + newline)
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        let executed = 0;
        for (const statement of statements) {
            if (statement.includes('BEGIN') || statement.includes('COMMIT')) {
                // Skip transaction statements for Neon serverless
                continue;
            }

            if (statement.trim().length === 0) continue;

            try {
                console.log(`\n📝 Executing: ${statement.substring(0, 60)}...`);
                await (sql as any)(statement);
                executed++;
                console.log('✅ Success');
            } catch (error: any) {
                // Some errors are expected (column doesn't exist, etc.)
                if (error.message.includes('does not exist') || error.message.includes('already exists')) {
                    console.log(`⚠️  Skipped (${error.message.substring(0, 50)}...)`);
                } else {
                    console.error(`❌ Error: ${error.message}`);
                    throw error;
                }
            }
        }

        console.log(`\n\n🎉 Migration complete! Executed ${executed} statements successfully.`);

        // Verify changes
        console.log('\n🔍 Verifying changes...');

        const usersColumns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `;

        console.log('\n📊 Users table columns:', usersColumns.map((c: any) => c.column_name).join(', '));

        const hasPublicId = usersColumns.some((c: any) => c.column_name === 'public_id');
        const hasPhoneCountryCode = usersColumns.some((c: any) => c.column_name === 'phone_country_code');

        if (!hasPublicId && !hasPhoneCountryCode) {
            console.log('✅ Users table migration verified!');
        } else {
            console.log('⚠️  Users table still has old columns');
        }

        const customerColumns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'profiles_customer'
        `;

        console.log('\n📊 Customer profiles columns:', customerColumns.map((c: any) => c.column_name).join(', '));

        const hasProfileId = customerColumns.some((c: any) => c.column_name === 'profile_id');

        if (!hasProfileId) {
            console.log('✅ Customer profiles migration verified!');
        } else {
            console.log('⚠️  Customer profiles still has profile_id');
        }

    } catch (error: any) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

runMigration();
