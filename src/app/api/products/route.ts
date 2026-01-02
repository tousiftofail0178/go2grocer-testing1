import { NextResponse } from 'next/server';
import { db } from '@/db';
import { globalCatalog } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const inStock = searchParams.get('inStock');

        // Build query conditions
        const conditions = [];

        if (category) {
            conditions.push(eq(globalCatalog.categoryId, parseInt(category)));
        }

        if (search) {
            conditions.push(sql`${globalCatalog.name} ILIKE ${`%${search}%`}`);
        }

        if (minPrice) {
            conditions.push(sql`CAST(${globalCatalog.sellingPrice} AS NUMERIC) >= ${parseFloat(minPrice)}`);
        }

        if (maxPrice) {
            conditions.push(sql`CAST(${globalCatalog.sellingPrice} AS NUMERIC) <= ${parseFloat(maxPrice)}`);
        }

        if (inStock === 'true') {
            conditions.push(sql`${globalCatalog.stockQuantity} > 0`);
        }

        // Execute query
        const products = await db
            .select()
            .from(globalCatalog)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
