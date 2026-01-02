import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, users, customerProfiles, businessProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/orders - Fetch orders for logged-in user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        console.log('Fetching orders for user:', userId);

        // First, find the user by publicId (UUID) to get the numeric ID
        const user = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.publicId, userId))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const numericUserId = user[0].id;

        // Get customer profile to check role type
        const customerProfile = await db
            .select({
                profileId: customerProfiles.profileId,
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
        let userOrders;

        if (profile.roleType === 'MANAGER') {
            // MANAGER: Strictly limited to their assigned business
            console.log('Fetching orders for MANAGER role');

            if (!profile.employerBusinessId) {
                return NextResponse.json({ orders: [] }); // No business assigned
            }

            userOrders = await db
                .select()
                .from(orders)
                .where(eq(orders.businessId, profile.employerBusinessId))
                .orderBy(desc(orders.createdAt));

        } else if (profile.roleType === 'OWNER') {
            // OWNER: Can see all businesses they own
            console.log('Fetching orders for OWNER role');

            const ownedBusinesses = await db
                .select({ businessId: businessProfiles.businessId })
                .from(businessProfiles)
                .where(eq(businessProfiles.ownerId, numericUserId));

            if (ownedBusinesses.length === 0) {
                return NextResponse.json({ orders: [] });
            }

            // Fetch orders from all owned businesses
            const businessIds = ownedBusinesses.map(b => b.businessId);
            userOrders = await db
                .select()
                .from(orders)
                .where(eq(orders.businessId, businessIds[0])) // Simplified for now - should use IN
                .orderBy(desc(orders.createdAt));

        } else {
            // CONSUMER or STAFF: See their personal orders
            console.log('Fetching orders for CONSUMER/STAFF role');

            userOrders = await db
                .select()
                .from(orders)
                .where(eq(orders.customerId, profile.profileId))
                .orderBy(desc(orders.createdAt));
        }

        // For each order, fetch the order items
        const ordersWithItems = await Promise.all(
            userOrders.map(async (order) => {
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
                        price: Number(item.priceAtPurchase) || 0,
                        quantity: item.quantity,
                        weight: '',
                        image: '',
                        rating: 0,
                        category: '',
                        inStock: true
                    })),
                    total: Number(order.totalAmountGross) || 0,
                    deliveryFee: Number(order.deliveryFee) || 0,
                    status: (order.orderStatus || 'pending') as 'Processing' | 'Delivered' | 'Cancelled',
                    shippingAddress: {
                        address: order.deliveryAddress || '',
                        area: '',
                        city: 'Chittagong',
                        phone: order.customerPhone || '',
                        name: order.customerName || ''
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
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Creating new order:', body);

        const {
            userId,
            items,
            total,
            deliveryFee,
            shippingAddress,
            paymentMethod
        } = body;

        // Validation
        if (!userId || !items || items.length === 0 || !total || !shippingAddress) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find the user by publicId (UUID) to get the numeric ID
        const user = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.publicId, userId))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const numericUserId = user[0].id;

        // Get customer profile to check role and determine order type
        const customerProfile = await db
            .select({
                profileId: customerProfiles.profileId,
                roleType: customerProfiles.roleType,
                employerBusinessId: customerProfiles.employerBusinessId,
            })
            .from(customerProfiles)
            .where(eq(customerProfiles.userId, numericUserId))
            .limit(1);

        if (customerProfile.length === 0) {
            return NextResponse.json(
                { error: 'Customer profile not found. Please create a profile first.' },
                { status: 404 }
            );
        }

        const profile = customerProfile[0];
        let customerId: number | null = null;
        let businessId: number | null = null;

        // Determine if this is a business order based on roleType
        if (profile.roleType === 'MANAGER') {
            // Manager: order for their assigned business
            console.log('Processing order for MANAGER');

            if (!profile.employerBusinessId) {
                return NextResponse.json(
                    { error: 'Manager not assigned to any business' },
                    { status: 400 }
                );
            }

            businessId = Number(profile.employerBusinessId);

        } else if (profile.roleType === 'OWNER') {
            // Owner: might select which business (pass in body), or default to first
            console.log('Processing order for OWNER');

            const selectedBusinessId = body.selectedBusinessId; // Optional in request

            if (selectedBusinessId) {
                // Verify owner owns this business
                const businessProfile = await db
                    .select()
                    .from(businessProfiles)
                    .where(eq(businessProfiles.businessId, selectedBusinessId))
                    .where(eq(businessProfiles.ownerId, numericUserId))
                    .limit(1);

                if (businessProfile.length === 0) {
                    return NextResponse.json(
                        { error: 'You do not own this business' },
                        { status: 403 }
                    );
                }

                businessId = selectedBusinessId;
            }
            // If no businessId selected, it's a personal order (not business)

        }
        // else: CONSUMER/STAFF - personal order, no businessId

        // Calculate estimated total
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const estimatedTotal = subtotal + (deliveryFee || 0);

        // Create the order
        const [newOrder] = await db
            .insert(orders)
            .values({
                customerId: businessId ? null : profile.profileId, // If business order, customerId is null
                businessId: businessId,
                createdBy: profile.profileId, // Track who created the order
                estimatedTotal: estimatedTotal.toString(),
                finalTotal: null, // Ops will update after shopping
                totalAmountGross: total.toString(),
                platformFee: '0', // Platform fee = 0 for now
                deliveryFee: deliveryFee.toString(),
                orderStatus: 'pending',
                paymentMethod: paymentMethod || 'cod',
                paymentStatus: 'pending',
                deliveryAddress: shippingAddress.address,
                customerName: shippingAddress.name,
                customerPhone: shippingAddress.phone,
            })
            .returning();

        // Create order items
        await db.insert(orderItems).values(
            items.map((item: any) => ({
                orderId: newOrder.orderId,
                productId: parseInt(item.id) || 1, // Default to 1 if parsing fails
                productName: item.name,
                quantity: item.quantity,
                priceAtPurchase: (item.price || 0).toString(),
            }))
        );

        console.log('Created order:', newOrder.orderId);

        return NextResponse.json({
            success: true,
            orderId: newOrder.orderId.toString(),
            order: {
                ...newOrder,
                id: newOrder.orderId.toString()
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error('=== ERROR CREATING ORDER ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Failed to create order. Please try again.', details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
