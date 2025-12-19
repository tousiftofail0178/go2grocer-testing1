
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        // Fetch order details with user
        const orderResult = await db
            .select({
                order: orders,
                user: users,
            })
            .from(orders)
            .leftJoin(users, eq(orders.userId, users.id))
            .where(eq(orders.id, orderId))
            .limit(1);

        if (orderResult.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const { order, user } = orderResult[0];

        // Fetch order items with product details
        const itemsResult = await db
            .select({
                item: orderItems,
                product: products,
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, orderId));

        // Format response
        const formattedOrder = {
            id: order.id,
            date: order.date,
            email: user?.email || 'No email',
            phone: user?.phone || 'No phone',
            shippingAddress: order.shippingAddress || 'No address provided',
            billingAddress: order.shippingAddress || 'Same as shipping', // Assuming same for now
            status: order.status,
            paymentMethod: order.paymentMethod,
            total: order.total,
            subtotal: order.total, // Simplified
            tax: 0, // Simplified
            shipping: order.deliveryFee,
            items: itemsResult.map(({ item, product }) => ({
                id: item.id,
                name: product?.name || 'Unknown Product',
                sku: 'SKU-123', // Placeholder
                price: item.priceAtPurchase || product?.price || 0,
                quantity: item.quantity,
                image: product?.image,
                total: (item.priceAtPurchase || product?.price || 0) * item.quantity
            })),
            customer: {
                id: user?.id,
                name: user?.name || 'No customer',
                ordersCount: 1, // Placeholder, would need another query
            }
        };

        return NextResponse.json(formattedOrder);

    } catch (error) {
        console.error('Error fetching order details:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const body = await request.json();
        const { status, paymentStatus } = body;

        const updateData: any = {};
        if (status) updateData.status = status; // Map to 'status' column, check schema if it's fulfillmentStatus
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields provided for update' },
                { status: 400 }
            );
        }

        // Update order in database
        await db
            .update(orders)
            .set(updateData)
            .where(eq(orders.id, orderId));

        return NextResponse.json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
