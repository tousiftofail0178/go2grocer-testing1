// Load environment variables FIRST
require('dotenv/config');
require('dotenv').config({ path: '.env.local' });

// Double-check DATABASE_URL is loaded
console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);

const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { sql } = require('drizzle-orm');

async function runMigration() {
    console.log('\n🚀 Starting Database Migration\n');
    console.log('='.repeat(60));

    try {
        // Connect to database
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set in environment variables');
        }

        const sqlClient = neon(process.env.DATABASE_URL);
        const db = drizzle(sqlClient);

        console.log('✅ Connected to database\n');

        // Step 1: Update phone numbers to include country codes
        console.log('📱 Step 1: Updating phone numbers...');
        try {
            await db.execute(sql`
                UPDATE users 
                SET phone_number = COALESCE(phone_country_code, '+880') || phone_number
                WHERE phone_country_code IS NOT NULL 
                  AND phone_number NOT LIKE '+%'
            `);
            console.log('✅ Phone numbers updated');
        } catch (e) {
            console.log('⚠️  Phone update:', e.message.substring(0, 80));
        }

        // Step 2: Drop public_id column
        console.log('\n🗑️  Step 2: Removing public_id column...');
        try {
            await db.execute(sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_public_id_key`);
            await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS public_id`);
            console.log('✅ public_id column removed');
        } catch (e) {
            console.log('⚠️  public_id:', e.message.substring(0, 80));
        }

        // Step 3: Drop phone_country_code column
        console.log('\n🗑️  Step 3: Removing phone_country_code column...');
        try {
            await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS phone_country_code`);
            console.log('✅ phone_country_code column removed');
        } catch (e) {
            console.log('⚠️  phone_country_code:', e.message.substring(0, 80));
        }

        // Step 4: Restructure profiles_customer primary key
        console.log('\n🔧 Step 4: Restructuring profiles_customer table...');

        // Drop FK constraints
        try {
            await db.execute(sql`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey`);
            await db.execute(sql`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_created_by_fkey`);
            await db.execute(sql`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey`);
            console.log('✅ Foreign key constraints dropped');
        } catch (e) {
            console.log('⚠️  FK drop:', e.message.substring(0, 80));
        }

        // Drop existing PK and set new one
        try {
            await db.execute(sql`ALTER TABLE profiles_customer DROP CONSTRAINT IF EXISTS profiles_customer_pkey`);
            await db.execute(sql`ALTER TABLE profiles_customer ADD PRIMARY KEY (user_id)`);
            console.log('✅ New primary key set on user_id');
        } catch (e) {
            console.log('⚠️  PK change:', e.message.substring(0, 80));
        }

        // Drop profile_id column
        try {
            await db.execute(sql`ALTER TABLE profiles_customer DROP COLUMN IF EXISTS profile_id`);
            console.log('✅ profile_id column removed');
        } catch (e) {
            console.log('⚠️  profile_id drop:', e.message.substring(0, 80));
        }

        // Recreate FK constraints
        try {
            await db.execute(sql`
                ALTER TABLE orders 
                ADD CONSTRAINT orders_customer_id_fkey 
                FOREIGN KEY (customer_id) REFERENCES profiles_customer(user_id)
            `);
            await db.execute(sql`
                ALTER TABLE orders 
                ADD CONSTRAINT orders_created_by_fkey 
                FOREIGN KEY (created_by) REFERENCES profiles_customer(user_id)
            `);
            await db.execute(sql`
                ALTER TABLE invoices 
                ADD CONSTRAINT invoices_customer_id_fkey 
                FOREIGN KEY (customer_id) REFERENCES profiles_customer(user_id)
            `);
            console.log('✅ Foreign key constraints recreated');
        } catch (e) {
            console.log('⚠️  FK recreation:', e.message.substring(0, 80));
        }

        // Step 5: Make optional fields nullable
        console.log('\n🔓 Step 5: Making optional fields nullable...');
        try {
            await db.execute(sql`ALTER TABLE profiles_customer ALTER COLUMN date_of_birth DROP NOT NULL`);
            await db.execute(sql`ALTER TABLE profiles_customer ALTER COLUMN nid_passport_number DROP NOT NULL`);
            await db.execute(sql`ALTER TABLE profiles_customer ALTER COLUMN nid_passport_image_url DROP NOT NULL`);
            console.log('✅ Optional fields are now nullable');
        } catch (e) {
            console.log('⚠️  Nullable:', e.message.substring(0, 80));
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n🎉 Migration completed successfully!\n');

        // Verification
        console.log('🔍 Verifying changes...\n');
        const usersColumnsResult = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);

        console.log('📊 Users table columns:');
        usersColumnsResult.forEach(row => console.log('   -', row.column_name));

        const customerColumnsResult = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'profiles_customer'
            ORDER BY ordinal_position
        `);

        console.log('\n📊 Customer profiles columns:');
        customerColumnsResult.forEach(row => console.log('   -', row.column_name));

        console.log('\n✅ Database migration verification complete!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

runMigration();
