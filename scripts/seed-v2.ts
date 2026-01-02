import { db } from '../src/db';
import { users, customerProfiles } from '../src/db/schema';

async function seed() {
    try {
        console.log('Seeding V2 database with test admin user...');

        // Create admin user
        const adminUsers = await db.insert(users).values({
            email: 'admin@go2grocer.com',
            phoneCountryCode: '+880',
            phoneNumber: '01712345678',
            passwordHash: '1234', // Plain text for testing (TODO: hash in production)
            role: 'admin',
            isVerified: true,
        }).returning();

        const adminUser = adminUsers[0];
        console.log('✅ Created admin user:', adminUser.email);

        // Create a test customer
        const customerUsers = await db.insert(users).values({
            email: 'customer@test.com',
            phoneCountryCode: '+880',
            phoneNumber: '01798765432',
            passwordHash: '1234',
            role: 'consumer',
            isVerified: true,
        }).returning();

        const customerUser = customerUsers[0];

        // Create customer profile
        await db.insert(customerProfiles).values({
            userId: customerUser.id,
            firstName: 'Test',
            lastName: 'Customer',
            phoneNumber: '01798765432',
            email: 'customer@test.com',
            loyaltyPoints: 100,
        });

        console.log('✅ Created test customer:', customerUser.email);
        console.log('\n🎉 Seed completed successfully!');
        console.log('\nTest Credentials:');
        console.log('  Admin: admin@go2grocer.com / 1234');
        console.log('  Customer: customer@test.com / 1234');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seed();
