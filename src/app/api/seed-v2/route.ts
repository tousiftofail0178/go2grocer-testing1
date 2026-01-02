import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
    try {
        const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('No database URL found');
        }

        const sql = neon(databaseUrl);

        console.log('Seeding V2 database with direct SQL...');

        // Generate UUIDs using PostgreSQL's gen_random_uuid()
        // Insert admin user (skip if exists)
        await sql`
            INSERT INTO users (public_id, email, phone_country_code, phone_number, password_hash, role_type, is_verified)
            VALUES (gen_random_uuid(), 'admin@go2grocer.com', '+880', '01712345678', '1234', 'admin', true)
            ON CONFLICT (email) DO NOTHING
        `;

        console.log('✅ Admin user ready');

        // Insert test customer (skip if exists)
        await sql`
            INSERT INTO users (public_id, email, phone_country_code, phone_number, password_hash, role_type, is_verified)
            VALUES (gen_random_uuid(), 'customer@test.com', '+880', '01798765432', '1234', 'consumer', true)
            ON CONFLICT (email) DO NOTHING
        `;

        console.log('✅ Created test customer');

        // Get the customer ID
        const customerResult = await sql`
            SELECT user_id FROM users WHERE email = 'customer@test.com'
        `;

        if (customerResult.length > 0) {
            const customerId = customerResult[0].user_id;

            await sql`
                INSERT INTO profiles_customer (user_id, first_name, last_name, phone_number, email, loyalty_points)
                VALUES (${customerId}, 'Test', 'Customer', '01798765432', 'customer@test.com', 100)
                ON CONFLICT (user_id) DO NOTHING
            `;

            console.log('✅ Customer profile ready');
        }

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully!',
            credentials: [
                { email: 'admin@go2grocer.com', password: '1234', role: 'admin' },
                { email: 'customer@test.com', password: '1234', role: 'consumer' }
            ]
        });

    } catch (error: any) {
        console.error('❌ Seed failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            detail: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}
