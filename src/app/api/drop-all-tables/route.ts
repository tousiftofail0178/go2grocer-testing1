import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        console.log('🧨 NUCLEAR OPTION: Dropping all existing tables...');

        // Drop all V1 tables in reverse dependency order
        await db.execute(sql`DROP TABLE IF EXISTS order_items CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS invoices CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS orders CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS products CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS businesses CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

        // Drop drizzle migrations table too
        await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`);

        console.log('✅ All V1 tables dropped successfully');

        return NextResponse.json({
            success: true,
            message: 'All existing tables dropped. Ready for fresh V2 schema push.',
            nextSteps: [
                'Run: npx drizzle-kit push',
                'Then visit: /api/seed-v2'
            ]
        });

    } catch (error: any) {
        console.error('❌ Drop failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            detail: error.toString()
        }, { status: 500 });
    }
}
