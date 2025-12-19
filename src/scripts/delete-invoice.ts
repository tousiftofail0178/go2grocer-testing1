
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as path from 'path';

// Fix for Windows paths in dotenv
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

async function main() {
    try {
        // Dynamic import to avoid hoisting issues
        const { db } = await import('../db');
        const { invoices } = await import('../db/schema');

        const orderId = '420600';
        console.log(`Deleting invoice for order ${orderId}...`);
        const res = await db.delete(invoices).where(eq(invoices.orderId, orderId));
        console.log('Deleted successfully', res);
    } catch (err) {
        console.error('Error deleting invoice:', err);
    }
    process.exit(0);
}

main();
