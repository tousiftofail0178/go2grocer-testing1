// Seed script to create test business applications for rejection testing
require('dotenv').config();
const { Client } = require('pg');

async function seedBusinessApplications() {
    console.log('🌱 Seeding test business applications...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // First, get an existing user ID or create a test user
        const userResult = await client.query(`
            SELECT user_id FROM users LIMIT 1
        `);

        let userId;
        if (userResult.rows.length > 0) {
            userId = userResult.rows[0].user_id;
            console.log(`📝 Using existing user ID: ${userId}`);
        } else {
            // Create a test user
            const newUser = await client.query(`
                INSERT INTO users (name, email, password_hash, role, phone_number, is_verified)
                VALUES ('Test Business User', 'testbusiness@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'customer', '01700000001', false)
                RETURNING user_id
            `);
            userId = newUser.rows[0].user_id;
            console.log(`✅ Created test user ID: ${userId}`);
        }

        // Create test business applications
        const testApplications = [
            {
                businessName: 'Fresh Food Corner',
                legalName: 'Fresh Food Corner Ltd.',
                email: 'freshfood@test.com',
                phone: '01711111111',
                tradeLicense: 'TL-2024-001',
                taxCert: 'TAX-2024-001'
            },
            {
                businessName: 'Green Grocers BD',
                legalName: 'Green Grocers Bangladesh Limited',
                email: 'greengrocers@test.com',
                phone: '01722222222',
                tradeLicense: 'TL-2024-002',
                taxCert: 'TAX-2024-002'
            },
            {
                businessName: 'City Mart',
                legalName: 'City Mart Trading Company',
                email: 'citymart@test.com',
                phone: '01733333333',
                tradeLicense: 'TL-2024-003',
                taxCert: 'TAX-2024-003'
            }
        ];

        console.log('📝 Inserting test applications...');

        for (const app of testApplications) {
            await client.query(`
                INSERT INTO business_applications (
                    user_id, business_name, legal_name, email, 
                    phone_number, trade_license_number, tax_certificate_number, 
                    status, applied_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
            `, [userId, app.businessName, app.legalName, app.email, app.phone, app.tradeLicense, app.taxCert]);

            console.log(`  ✅ Created: ${app.businessName}`);
        }

        console.log('\n🎉 Successfully seeded test business applications!');
        console.log('👉 Go to http://localhost:3000/admin/registrations to test rejection');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

seedBusinessApplications()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
