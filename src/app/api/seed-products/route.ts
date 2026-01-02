import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
    try {
        const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('No database URL found');
        }

        const sql = neon(databaseUrl);
        const results = {
            categoriesCreated: 0,
            productsCreated: 0,
            errors: [] as string[],
        };

        console.log('🌱 Starting product seeding...');

        // Create categories first
        try {
            const vegResult = await sql`
                INSERT INTO categories (name, slug, description)
                VALUES ('Fresh Vegetables', 'fresh-vegetables', 'Fresh and organic vegetables')
                ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
                RETURNING category_id, name
            `;
            console.log('✅ Created/Updated category:', vegResult[0]);
            results.categoriesCreated++;

            const fruitResult = await sql`
                INSERT INTO categories (name, slug, description)
                VALUES ('Fruits', 'fruits', 'Fresh seasonal fruits')
                ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
                RETURNING category_id, name
            `;
            console.log('✅ Created/Updated category:', fruitResult[0]);
            results.categoriesCreated++;
        } catch (error: any) {
            const errorMsg = `Category creation failed: ${error.message}`;
            console.error('❌', errorMsg);
            results.errors.push(errorMsg);
        }

        // Get category IDs
        const categories = await sql`SELECT category_id, name FROM categories WHERE slug IN ('fresh-vegetables', 'fruits')`;
        const vegCategoryId = categories.find(c => c.slug === 'fresh-vegetables' || c.name === 'Fresh Vegetables')?.category_id;
        const fruitCategoryId = categories.find(c => c.slug === 'fruits' || c.name === 'Fruits')?.category_id;

        if (!vegCategoryId || !fruitCategoryId) {
            throw new Error(`Categories not found. Veg: ${vegCategoryId}, Fruit: ${fruitCategoryId}`);
        }

        console.log(`📁 Using category IDs - Vegetables: ${vegCategoryId}, Fruits: ${fruitCategoryId}`);

        // Insert test products
        const products = [
            { name: 'Tomato', unit: '1 kg', category: vegCategoryId, image: '/images/products/tomato.jpg', stock: 100 },
            { name: 'Potato', unit: '1 kg', category: vegCategoryId, image: '/images/products/potato.jpg', stock: 200 },
            { name: 'Onion', unit: '1 kg', category: vegCategoryId, image: '/images/products/onion.jpg', stock: 150 },
            { name: 'Carrot', unit: '500g', category: vegCategoryId, image: '/images/products/carrot.jpg', stock: 80 },
            { name: 'Banana', unit: '1 doz', category: fruitCategoryId, image: '/images/products/banana.jpg', stock: 120 },
            { name: 'Apple', unit: '1 kg', category: fruitCategoryId, image: '/images/products/apple.jpg', stock: 50 },
            { name: 'Orange', unit: '1 kg', category: fruitCategoryId, image: '/images/products/orange.jpg', stock: 70 },
            { name: 'Mango', unit: '1 kg', category: fruitCategoryId, image: '/images/products/mango.jpg', stock: 60 },
        ];

        for (const product of products) {
            try {
                const result = await sql`
                    INSERT INTO global_catalog (name, base_image_url, base_unit, category_id, stock_quantity)
                    VALUES (${product.name}, ${product.image}, ${product.unit}, ${product.category}, ${product.stock})
                    ON CONFLICT (name) DO UPDATE 
                    SET stock_quantity = EXCLUDED.stock_quantity, 
                        base_unit = EXCLUDED.base_unit,
                        category_id = EXCLUDED.category_id
                    RETURNING global_product_id, name, stock_quantity
                `;
                console.log(`✅ Seeded product: ${result[0].name} (ID: ${result[0].global_product_id})`);
                results.productsCreated++;
            } catch (error: any) {
                const errorMsg = `Failed to seed ${product.name}: ${error.message}`;
                console.error('❌', errorMsg);
                results.errors.push(errorMsg);
            }
        }

        // Verify products in database
        const productCount = await sql`SELECT COUNT(*) as count FROM global_catalog`;
        console.log(`📊 Total products in database: ${productCount[0].count}`);

        return NextResponse.json({
            success: results.errors.length === 0,
            message: results.errors.length === 0
                ? 'Products seeded successfully!'
                : 'Seeding completed with errors',
            results: {
                categoriesCreated: results.categoriesCreated,
                productsCreated: results.productsCreated,
                totalInDatabase: productCount[0].count,
                errors: results.errors
            }
        });

    } catch (error: any) {
        console.error('❌ Fatal error during product seeding:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            detail: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}
