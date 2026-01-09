
import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export async function GET(req: Request, props: { params: Promise<{ orderId: string }> }) {
    try {
        const params = await props.params;
        const orderId = params.orderId;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        // 1. Find blob key from DB
        const invoiceRecords = await db.select().from(invoices).where(eq(invoices.orderId, parseInt(orderId)));
        const invoice = invoiceRecords[0];

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // 2. Fetch from Blobs
        const store = getStore({
            name: 'invoices',
            siteID: process.env.NETLIFY_SITE_ID,
            token: process.env.NETLIFY_AUTH_TOKEN,
        });

        if (!invoice.blobKey) {
            return NextResponse.json({ error: 'Invoice PDF not available' }, { status: 404 });
        }

        const blob = await store.get(invoice.blobKey, { type: 'arrayBuffer' });

        if (!blob) {
            return NextResponse.json({ error: 'Invoice file not found' }, { status: 404 });
        }

        // 3. Return as PDF stream
        return new NextResponse(blob, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="invoice-${orderId}.pdf"`,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });

    } catch (error: any) {
        console.error('Fetch invoice failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
