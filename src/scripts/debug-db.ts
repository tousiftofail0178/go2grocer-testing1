
import { db } from '@/db';
import { orders, users, invoices } from '@/db/schema';
import { count } from 'drizzle-orm';

async function main() {
    console.log('Checking database content...');

    try {
        // Check Orders
        const orderCount = await db.select({ count: count() }).from(orders);
        console.log('Total Orders:', orderCount[0].count);

        const allOrders = await db.select().from(orders).limit(5);
        console.log('Sample Orders:', JSON.stringify(allOrders, null, 2));

        // Check Invoices to see if there's a mismatch
        const invoiceCount = await db.select({ count: count() }).from(invoices);
        console.log('Total Invoices:', invoiceCount[0].count);

        const allInvoices = await db.select().from(invoices).limit(5);
        console.log('Sample Invoices:', JSON.stringify(allInvoices, null, 2));

    } catch (error) {
        console.error('Error querying DB:', error);
    }

    process.exit(0);
}

main();
