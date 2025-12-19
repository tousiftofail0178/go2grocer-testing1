
import { db } from '@/db';
import { orderItems, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const targetOrderId = '310584';
    console.log(`Checking items for Order ID: ${targetOrderId}`);

    try {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, targetOrderId));
        console.log(`Found ${items.length} items.`);
        console.log(JSON.stringify(items, null, 2));

        const order = await db.select().from(orders).where(eq(orders.id, targetOrderId));
        console.log('Order details:', JSON.stringify(order, null, 2));

    } catch (error) {
        console.error('Error querying DB:', error);
    }

    process.exit(0);
}

main();
