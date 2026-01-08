import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, users, customerProfiles, businessProfiles, invoices, addresses } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

// GET /api/orders - Fetch orders for logged-in user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Verify User exists
        if (isNaN(Number(userId))) {
            return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
        }
        const numericUserId = parseInt(userId);

        // Get customer profile to check role type
        const customerProfile = await db
            .select({
                profileId: customerProfiles.userId,
                roleType: customerProfiles.roleType,
                employerBusinessId: customerProfiles.employerBusinessId,
            })
            .from(customerProfiles)
            .where(eq(customerProfiles.userId, numericUserId))
            .limit(1);

        if (customerProfile.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        const profile = customerProfile[0];
        // Define type for the joined result
        let userOrders: { order: typeof orders.$inferSelect, address: typeof addresses.$inferSelect | null }[] = [];

        if (profile.roleType === 'MANAGER') {
            // MANAGER: Strictly limited to their assigned business
            if (!profile.employerBusinessId) {
                return NextResponse.json({ orders: [] });
            }

            userOrders = await db
                .select({
                    order: orders,
                    address: addresses
                })
                .from(orders)
                .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id))
                .where(eq(orders.businessId, profile.employerBusinessId))
                .orderBy(desc(orders.createdAt));

        } else if (profile.roleType === 'OWNER') {
            // OWNER: Can see all businesses they own
            const ownedBusinesses = await db
                .select({ businessId: businessProfiles.businessId })
                .from(businessProfiles)
                .where(eq(businessProfiles.ownerId, numericUserId));

            if (ownedBusinesses.length === 0) {
                return NextResponse.json({ orders: [] });
            }

            // Fetch orders from all owned businesses
            const businessIds = ownedBusinesses.map(b => b.businessId);

            // Use inArray to get orders for ALL businesses
            userOrders = await db
                .select({
                    order: orders,
                    address: addresses
                })
                .from(orders)
                .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id))
                .where(inArray(orders.businessId, businessIds))
                .orderBy(desc(orders.createdAt));

        } else {
            // CONSUMER or STAFF: See their personal orders
            userOrders = await db
                .select({
                    order: orders,
                    address: addresses
                })
                .from(orders)
                .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id))
                .where(eq(orders.userId, profile.profileId))
                .orderBy(desc(orders.createdAt));
        }

        // For each order, fetch the order items
        const ordersWithItems = await Promise.all(
            userOrders.map(async (row) => {
                const { order, address } = row;

                const items = await db
                    .select()
                    .from(orderItems)
                    .where(eq(orderItems.orderId, order.orderId));

                return {
                    id: order.orderId.toString(),
                    date: order.createdAt?.toISOString().split('T')[0] || '',
                    items: items.map(item => ({
                        id: item.productId?.toString() || '',
                        name: item.productName || '',
                        price: Number(item.unitPrice) || 0,
                        quantity: item.quantity,
                        weight: '',
                        image: '',
                        rating: 0,
                        category: '',
                        inStock: true
                    })),
                    total: Number(order.totalAmount) || 0,
                    deliveryFee: 0,
                    status: (order.status || 'pending') as 'Processing' | 'Delivered' | 'Cancelled',
                    shippingAddress: {
                        address: address?.streetAddress || 'Business Address',
                        area: address?.area || '',
                        city: address?.city || 'Chittagong',
                        // Ensure these are never undefined in JSON
                        phone: '',
                        name: ''
                    },
                    paymentMethod: order.paymentMethod || 'cod'
                };
            })
        );

        return NextResponse.json({
            orders: ordersWithItems,
        });

    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create a new order
// POST /api/orders - Create a new order
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, selectedBusinessId, items, paymentMethod, poNumber, orderNotes } = body;

        // Map frontend key to backend logic
        const businessId = selectedBusinessId;

        // Validation
        if (!userId || !businessId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Business Profile to get Address
        const businessResult = await db.select()
            .from(businessProfiles)
            .where(eq(businessProfiles.businessId, businessId))
            .limit(1);

        const business = businessResult[0];

        if (!business || !business.addressId) {
            return NextResponse.json(
                { error: 'Business invalid or missing linked address. Please update your business profile.' },
                { status: 400 }
            );
        }

        const targetAddressId = business.addressId;

        // 2. Calculate Total
        const totalAmount = items.reduce((sum: number, item: any) =>
            sum + (Number(item.price || item.priceAtPurchase || 0) * item.quantity), 0
        );
        const totalString = totalAmount.toFixed(2);

        // 3. Insert Order (New Schema - No Legacy Fields)
        const [newOrder] = await db.insert(orders).values({
            userId: Number(userId),
            businessId: Number(businessId),
            shippingAddressId: targetAddressId,
            totalAmount: totalString,
            status: 'pending',
            paymentStatus: 'unpaid',
            paymentMethod: paymentMethod || 'cod',
            poNumber: poNumber || null,
            orderNotes: orderNotes || null,
            // createdAt defaults to NOW()
        }).returning({ orderId: orders.orderId });

        // 4. Insert Order Items
        for (const item of items) {
            const productId = Number(item.id);
            if (isNaN(productId)) {
                console.warn(`Invalid Product ID for item: ${item.name}`);
                continue;
            }

            await db.insert(orderItems).values({
                orderId: newOrder.orderId,
                productId: productId,
                productName: item.name,
                quantity: item.quantity,
                unitPrice: Number(item.price || 0).toFixed(2),
                totalPrice: (Number(item.price || 0) * item.quantity).toFixed(2)
            });
        }

        // 5. Generate Invoice
        const invoiceNum = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await db.insert(invoices).values({
            orderId: newOrder.orderId,
            invoiceNumber: invoiceNum,
            status: 'Unpaid',
            amountDue: totalString
        });

        // Success!
        return NextResponse.json({ success: true, orderId: newOrder.orderId.toString() });

    } catch (error: any) {
        console.error("Order Creation Error:", error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to create order',
                details: error.stack,
                pgCode: error.code,
                pgDetail: error.detail,
                pgConstraint: error.constraint
            },
            { status: 500 }
        );
    }
}
