
import { db } from '../src/db';
import { users, products } from '../src/db/schema';
import { products as mockProducts } from '../src/lib/data';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function seed() {
    console.log('🌱 Seeding database...');

    // 1. Seed Users
    console.log('Creating users...');

    const existingUsers = await db.select().from(users).where(eq(users.userId, 'G2G-001'));
    if (existingUsers.length === 0) {
        await db.insert(users).values([
            { userId: 'G2G-001', name: 'System Admin', phone: '01000000000', role: 'admin', password: '1234' },
            { userId: 'G2G-002', name: 'Business Owner', phone: '01000000000', role: 'owner', password: '1234' },
            { userId: 'G2G-003', name: 'Store Manager', phone: '01000000000', role: 'manager', password: '1234' },
        ]);
        console.log('✅ Users created.');
    } else {
        console.log('ℹ️ Users already exist.');
    }

    // 2. Seed Products
    console.log('Creating products...');
    for (const product of mockProducts) {
        // Check if product exists
        const existing = await db.select().from(products).where(eq(products.id, product.id));
        if (existing.length === 0) {
            await db.insert(products).values({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                weight: product.weight,
                image: product.image,
                rating: product.rating.toString(),
                category: product.category,
                inStock: product.inStock,
                isNew: product.isNew,
                discount: product.discount,
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
