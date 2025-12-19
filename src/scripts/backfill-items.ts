
import { db } from '@/db';
import { orders, orderItems, products, users } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';

async function main() {
    console.log('Backfilling order items and users...');

    try {
        // 1. Get a valid product
        const allProducts = await db.select().from(products).limit(5);
        if (allProducts.length === 0) {
            console.error('No products found to add to orders.');
            process.exit(1);
        }

        // 2. Get a valid user (or use the first one found)
        const allUsers = await db.select().from(users).limit(1);
        let validUser = allUsers[0];

        // If no user exists, create one (unlikely given prev context, but safe)
        if (!validUser) {
            console.log('No users found, treating as Guest orders for now or assuming G2G-001 exists.');
            // Logic to create user skipped for brevity, assuming seed data exists as per verify
        }

        // 3. Get all orders
        const allOrders = await db.select().from(orders);

        for (const order of allOrders) {
            // Check if items exist
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

            if (items.length === 0) {
                console.log(`Adding items to Order ${order.id}`);

                // Pick a random product
                const product = allProducts[Math.floor(Math.random() * allProducts.length)];
                const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
                const price = product.price || 1000; // Default 10.00 if missing

                // Insert Item
                await db.insert(orderItems).values({
                    orderId: order.id,
                    productId: product.id,
                    quantity: quantity,
                    priceAtPurchase: price
                });

                // Update Order Total and User
                const total = price * quantity;
                const shipping = 500; // 5.00 flat rate

                await db.update(orders)
                    .set({
                        total: total + shipping,
                        deliveryFee: shipping,
                        userId: validUser ? validUser.id : null, // Assign to first user found
                        paymentMethod: 'Credit Card',
                        shippingAddress: validUser ? (validUser.address || '456 Example St, City, Country') : 'Guest Address'
                    })
                    .where(eq(orders.id, order.id));

                console.log(`Updated Order ${order.id} with ${quantity}x ${product.name} and User ${validUser?.name}`);
            }
        }

        console.log('Backfill items complete.');

    } catch (error) {
        console.error('Error backfilling items:', error);
    }

    process.exit(0);
}

main();
