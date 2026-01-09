
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, products } from '@/db/schema';
import { products as mockProducts, User } from '@/lib/data';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        // 1. Seed Users
        const existingUsers = await db.select().from(users).where(eq(users.email, 'admin@go2grocer.com'));

        let usersCreated = 0;
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
            usersCreated = 3;
        }

        // 2. Seed Products (Corrected types)
        let productsCreated = 0;
        for (const product of mockProducts) {
            // Check by name since ID types mismatch (string vs number)
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
