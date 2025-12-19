
import { db } from '@/db';
import { orders, invoices } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Backfilling orders from invoices...');

    try {
        const allInvoices = await db.select().from(invoices);

        for (const inv of allInvoices) {
            // Check if order exists
            const existingOrder = await db.select().from(orders).where(eq(orders.id, inv.orderId));

            if (existingOrder.length === 0) {
                console.log(`Creating order for Invoice OrderID: ${inv.orderId}`);

                // Insert placeholder order data
                // Since we don't have total/userId in invoices table, we'll use defaults or try to parse
                // Real implementation would fetching from Stripe/Shopify source if available, 
                // but here we just want the admin panel to not be empty.
                await db.insert(orders).values({
                    id: inv.orderId,
                    userId: null, // Unknown user
                    total: 0, // Unknown total
                    deliveryFee: 0,
                    status: 'Processing',
                    paymentMethod: 'Unknown',
                    shippingAddress: 'Unknown',
                    date: inv.createdAt // Use invoice creation date
                });
            } else {
                console.log(`Order ${inv.orderId} already exists.`);
            }
        }

        console.log('Backfill complete.');

    } catch (error) {
        console.error('Error backfilling:', error);
    }

    process.exit(0);
}

main();
