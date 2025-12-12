
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, products } from '@/db/schema';
import { products as mockProducts, User } from '@/lib/data';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        // 1. Seed Users
        const existingUsers = await db.select().from(users).where(eq(users.userId, 'G2G-001'));

        let usersCreated = 0;
        if (existingUsers.length === 0) {
            await db.insert(users).values([
                { userId: 'G2G-001', name: 'System Admin', phone: '01000000000', role: 'admin', password: '1234' },
                { userId: 'G2G-002', name: 'Business Owner', phone: '01000000000', role: 'owner', password: '1234' },
                { userId: 'G2G-003', name: 'Store Manager', phone: '01000000000', role: 'manager', password: '1234' },
            ]);
            usersCreated = 3;
        }

        // 2. Seed Products
        let productsCreated = 0;
        for (const product of mockProducts) {
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
                productsCreated++;
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            stats: { usersCreated, productsCreated }
        });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
