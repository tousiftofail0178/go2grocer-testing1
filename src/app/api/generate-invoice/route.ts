import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, orders, orderItems, businessProfiles, addresses, globalCatalog } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { InvoiceData } from '@/types/invoice';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { order_id, invoice_id } = body;

        if (!order_id && !invoice_id) {
            return NextResponse.json(
                { success: false, error: 'Order ID or Invoice ID required' },
                { status: 400 }
            );
        }

        // 1. Fetch Invoice Details (Join Order & Business & Address)
        let query = db
            .select({
                id: invoices.invoiceId,
                invoiceNumber: invoices.invoiceNumber,
                orderId: invoices.orderId,
                date: orders.createdAt,
                totalAmount: invoices.amountDue,
                status: invoices.status,
                businessName: businessProfiles.businessName,
                businessId: businessProfiles.businessId, // For Customer ID
                // Address fields
                street: addresses.streetAddress,
                area: addresses.area,
                city: addresses.city,
                postalCode: addresses.postalCode
            })
            .from(invoices)
            .innerJoin(orders, eq(invoices.orderId, orders.orderId))
            .innerJoin(businessProfiles, eq(orders.businessId, businessProfiles.businessId))
            .leftJoin(addresses, eq(businessProfiles.addressId, addresses.id)); // Join Address

        // Apply filter
        if (invoice_id) {
            query.where(eq(invoices.invoiceId, invoice_id));
        } else {
            query.where(eq(invoices.orderId, order_id));
        }

        const invoiceResult = await query;
        const invoiceDataRaw = invoiceResult[0];

        if (!invoiceDataRaw) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // 2. Fetch Items (Join with Global Catalog for Unit/Size)
        const items = await db
            .select({
                productName: orderItems.productName,
                quantity: orderItems.quantity,
                unitPrice: orderItems.unitPrice,
                totalPrice: orderItems.totalPrice,
                productId: orderItems.productId,
                baseUnit: globalCatalog.baseUnit,      // Fetch Unit
                packSize: globalCatalog.packSizeLabel  // Fetch Pack Size (optional)
            })
            .from(orderItems)
            .innerJoin(globalCatalog, eq(orderItems.productId, globalCatalog.globalProductId))
            .where(eq(orderItems.orderId, invoiceDataRaw.orderId));

        // 3. Construct Address String
        const addressParts = [
            invoiceDataRaw.street,
            invoiceDataRaw.area,
            invoiceDataRaw.city,
            invoiceDataRaw.postalCode
        ].filter(Boolean);

        const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address Not Provided';

        // 4. Map to Strict Interface
        const safeInvoice: InvoiceData = {
            id: invoiceDataRaw.id,
            invoiceNumber: invoiceDataRaw.invoiceNumber,
            date: invoiceDataRaw.date ? new Date(invoiceDataRaw.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            orderId: invoiceDataRaw.orderId,
            status: invoiceDataRaw.status,

            businessName: invoiceDataRaw.businessName || 'Guest Customer',
            businessAddress: fullAddress, // Real Address mapped here
            businessPhone: '',
            // Map BusinessID to CustomerID
            customerId: `REL-${String(invoiceDataRaw.businessId).padStart(3, '0')}`,

            totalAmount: Number(invoiceDataRaw.totalAmount),
            vatAmount: 0,

            items: items.map(item => ({
                sku: String(item.productId),
                description: item.productName,
                quantity: item.quantity,
                unit: item.baseUnit || 'Unit', // Use real unit or fallback
                size: item.packSize || '-',    // Use real pack size or dash
                unitPrice: Number(item.unitPrice),
                totalPrice: Number(item.totalPrice)
            }))
        };

        // 5. Generate Sligro PDF
        const pdfBuffer = generateInvoicePDF(safeInvoice);

        // 6. Return
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${safeInvoice.invoiceNumber}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('Invoice Generation Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
