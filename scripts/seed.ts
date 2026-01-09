
import { db } from '../src/db';
// import { businesses } from '../src/db/schema'; // Table removed
import { users, products } from '../src/db/schema';
import { products as mockProducts } from '../src/lib/data';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function seed() {
    console.log('🌱 Seeding database...');

    // 1. Seed Users (Corrected roles and fields)
    console.log('Creating users...');
    const existingUsers = await db.select().from(users).where(eq(users.email, 'admin@go2grocer.com'));

    if (existingUsers.length === 0) {
        await db.insert(users).values([
            {
                email: 'admin@go2grocer.com',
                phoneNumber: '+8801000000000',
                role: 'admin',
                passwordHash: '$2a$10$abcdefg',
                isVerified: true
            },
            {
                email: 'owner@example.com',
                phoneNumber: '+8801000000001',
                role: 'business_owner',
                passwordHash: '$2a$10$abcdefg',
                isVerified: true
            },
            {
                email: 'manager@example.com',
                phoneNumber: '+8801000000002',
                role: 'business_manager',
                passwordHash: '$2a$10$abcdefg',
                isVerified: true
            },
        ]);
        console.log('✅ Users created.');
    } else {
        console.log('ℹ️ Users already exist.');
    }

    /* 
    // Legacy Business Seeding - Disabled as 'businesses' table is replaced by 'businessProfiles'
    // 1.5 Seed Businesses for G2G-002
    console.log('Creating businesses for G2G-002...');
    ...
    */

    // 2. Seed Products
    console.log('Creating products...');
    for (const product of mockProducts) {
        // Check by name as ID types mismatch
        const existing = await db.select().from(products).where(eq(products.name, product.name));

        if (existing.length === 0) {
            await db.insert(products).values({
                name: product.name,
                price: product.price?.toString() || '0',
                packSize: product.weight, // Map weight to packSize
                image: product.image,
                category: product.category,
                inStock: product.inStock,
            });
        }
    }
    console.log('✅ Products seeded.');

    console.log('🌱 Seeding complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
