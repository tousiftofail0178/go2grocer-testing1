import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, orders, orderItems, businessProfiles, customerProfiles, addresses } from '@/db/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { InvoiceData } from '@/types/invoice';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId || isNaN(Number(userId))) {
            return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
        }

        const numericUserId = parseInt(userId);

        // 1. Determine Role & Business IDs
        const profile = await db.query.customerProfiles.findFirst({
            where: eq(customerProfiles.userId, numericUserId),
            columns: {
                roleType: true,
                employerBusinessId: true
            }
        });

        if (!profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        let businessIds: number[] = [];

        if (profile.roleType === 'OWNER') {
            const owned = await db
                .select({ id: businessProfiles.businessId })
                .from(businessProfiles)
                .where(eq(businessProfiles.ownerId, numericUserId));
            businessIds = owned.map(b => b.id);
        } else if (profile.roleType === 'MANAGER' && profile.employerBusinessId) {
            businessIds = [profile.employerBusinessId];
        }

        if (businessIds.length === 0) {
            return NextResponse.json({ invoices: [] });
        }

        // 2. Fetch Invoices (Raw Data with Address Join)
        const rawInvoices = await db
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
            .leftJoin(addresses, eq(businessProfiles.addressId, addresses.id)) // Join Address
            .where(inArray(orders.businessId, businessIds))
            .orderBy(desc(invoices.generatedAt));

        // 3. Fetch Items (Batch)
        const orderIds = rawInvoices.map(i => i.orderId).filter(Boolean) as number[];

        let allItems: any[] = [];
        if (orderIds.length > 0) {
            allItems = await db
                .select({
                    orderId: orderItems.orderId,
                    productName: orderItems.productName,
                    quantity: orderItems.quantity,
                    unitPrice: orderItems.unitPrice,
                    totalPrice: orderItems.totalPrice,
                    productId: orderItems.productId
                })
                .from(orderItems)
                .where(inArray(orderItems.orderId, orderIds));
        }

        // 4. Map to Strict Interface (InvoiceData)
        const mappedInvoices: InvoiceData[] = rawInvoices.map(inv => {
            const myItems = allItems.filter(item => item.orderId === inv.orderId);

            // Construct Address String
            const addressParts = [inv.street, inv.area, inv.city, inv.postalCode].filter(Boolean);
            const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address Not Provided';

            return {
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                status: inv.status,
                orderId: inv.orderId,
                date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],

                // Business Details
                businessName: inv.businessName || 'Business Customer',
                businessAddress: fullAddress, // Real Address mapped here
                businessPhone: '',
                // Map BusinessID to CustomerID
                customerId: `REL-${String(inv.businessId).padStart(3, '0')}`,

                // Financials
                totalAmount: Number(inv.totalAmount),
                vatAmount: 0,

                // Strict Item Mapping
                items: myItems.map(item => ({
                    sku: String(item.productId),
                    description: item.productName || 'Item',
                    quantity: Number(item.quantity),
                    unit: 'Unit',
                    size: '-',
                    unitPrice: Number(item.unitPrice),
                    totalPrice: Number(item.totalPrice)
                }))
            };
        });

        return NextResponse.json({ invoices: mappedInvoices });

    } catch (error: any) {
        console.error('Invoice Fetch Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices', details: error.message },
            { status: 500 }
        );
    }
}
