import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../db';
import { invoices } from '../db/schema';

async function main() {
    try {
        console.log('Fetching invoices...');
        const allInvoices = await db.select().from(invoices);
        console.log('Total invoices:', allInvoices.length);
        console.table(allInvoices.map(inv => ({
            id: inv.id,
            orderId: inv.orderId,
            blobKey: inv.blobKey,
            email: inv.customerEmail
        })));
    } catch (err) {
        console.error('Error fetching invoices:', err);
    }
    process.exit(0);
}

main();
