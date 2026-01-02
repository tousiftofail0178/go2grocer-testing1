import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';

/**
 * Seed test users for all 5 role types
 * Each user will have password: 1234
 */
export async function GET() {
    try {
        const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('No database URL found');
        }

        const sql = neon(databaseUrl);
        const results = {
            usersCreated: 0,
            profilesCreated: 0,
            errors: [] as string[],
        };

        console.log('🌱 Seeding test users for all roles...');

        // Test users configuration
        const testUsers = [
            {
                email: 'admin@go2grocer.com',
                phone: '01712345678',
                password: '1234',
                role: 'admin',
                firstName: 'System',
                lastName: 'Admin',
                profileType: null
            },
            {
                email: 'operations@go2grocer.com',
                phone: '01712345679',
                password: '1234',
                role: 'g2g_operations',
                firstName: 'Operations',
                lastName: 'Manager',
                profileType: null
            },
            {
                email: 'social@go2grocer.com',
                phone: '01712345680',
                password: '1234',
                role: 'g2g_social_media',
                firstName: 'Social Media',
                lastName: 'Team',
                profileType: null
            },
            {
                email: 'owner@business.com',
                phone: '01712345681',
                password: '1234',
                role: 'business_owner',
                firstName: 'Business',
                lastName: 'Owner',
                profileType: 'business'
            },
            {
                email: 'manager@business.com',
                phone: '01712345682',
                password: '1234',
                role: 'business_manager',
                firstName: 'Business',
                lastName: 'Manager',
                profileType: 'business'
            },
            {
                email: 'customer@test.com',
                phone: '01798765432',
                password: '1234',
                role: 'consumer',
                firstName: 'Test',
                lastName: 'Customer',
                profileType: 'customer'
            },
        ];

        for (const user of testUsers) {
            try {
                const publicId = randomUUID();

                // Insert user
                const userCheck = await sql`SELECT user_id FROM users WHERE email = ${user.email}`;

                if (userCheck.length === 0) {
                    await sql`
                        INSERT INTO users (public_id, email, phone_country_code, phone_number, password_hash, role_type, is_verified)
                        VALUES (${publicId}::uuid, ${user.email}, '+880', ${user.phone}, ${user.password}, ${user.role}::role_type, true)
                    `;
                    console.log(`✅ Created user: ${user.email} (${user.role})`);
                    results.usersCreated++;
                } else {
                    console.log(`⏭️ User already exists: ${user.email}`);
                }

                // Create profile if needed
                if (user.profileType === 'customer') {
                    const userResult = await sql`SELECT user_id FROM users WHERE email = ${user.email}`;
                    if (userResult.length > 0) {
                        const userId = userResult[0].user_id;
                        const profileCheck = await sql`SELECT profile_id FROM profiles_customer WHERE user_id = ${userId}`;

                        if (profileCheck.length === 0) {
                            await sql`
                                INSERT INTO profiles_customer (user_id, first_name, last_name, phone_number, email, loyalty_points)
                                VALUES (${userId}, ${user.firstName}, ${user.lastName}, ${user.phone}, ${user.email}, 0)
                            `;
                            console.log(`  ✅ Created customer profile`);
                            results.profilesCreated++;
                        }
                    }
                } else if (user.profileType === 'business') {
                    const userResult = await sql`SELECT user_id FROM users WHERE email = ${user.email}`;
                    if (userResult.length > 0) {
                        const userId = userResult[0].user_id;
                        const profileCheck = await sql`SELECT business_id FROM profiles_business WHERE user_id = ${userId}`;

                        if (profileCheck.length === 0) {
                            await sql`
                                INSERT INTO profiles_business (
                                    user_id, business_name, legal_name, phone_number, email,
                                    trade_license_number, tax_certificate_number, expiry_date,
                                    verification_status
                                )
                                VALUES (
                                    ${userId}, 
                                    ${user.firstName + "'s Business"}, 
                                    ${user.firstName + " " + user.lastName + " LLC"}, 
                                    ${user.phone}, 
                                    ${user.email},
                                    'TL-' || ${userId}, 
                                    'TAX-' || ${userId}, 
                                    '2025-12-31',
                                    'verified'
                                )
                            `;
                            console.log(`  ✅ Created business profile`);
                            results.profilesCreated++;
                        }
                    }
                }
            } catch (error: any) {
                const errorMsg = `Failed to seed ${user.email}: ${error.message}`;
                console.error('❌', errorMsg);
                results.errors.push(errorMsg);
            }
        }

        // Verify total users
        const userCount = await sql`SELECT COUNT(*) as count FROM users`;
        console.log(`📊 Total users in database: ${userCount[0].count}`);

        return NextResponse.json({
            success: results.errors.length === 0,
            message: results.errors.length === 0
                ? 'All test users seeded successfully!'
                : 'User seeding completed with errors',
            results: {
                usersCreated: results.usersCreated,
                profilesCreated: results.profilesCreated,
                totalUsers: userCount[0].count,
                errors: results.errors
            },
            testAccounts: testUsers.map(u => ({
                email: u.email,
                password: u.password,
                role: u.role
            }))
        });

    } catch (error: any) {
        console.error('❌ Fatal error during user seeding:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            detail: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}
