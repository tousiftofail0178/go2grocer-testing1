import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/ops/orders
// Fetch all pending orders for operations dashboard
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        // Ops can see all orders with specified status
        const pendingOrders = await db
            .select()
            .from(orders)
            .where(eq(orders.orderStatus, status))
            .orderBy(orders.createdAt);

        // For each order, get items
        const ordersWithItems = await Promise.all(
            pendingOrders.map(async (order) => {
                const items = await db
                    .select()
                    .from(orderItems)
                    .where(eq(orderItems.orderId, order.orderId));

                return {
                    ...order,
                    items,
                };
            })
        );

        return NextResponse.json({
            orders: ordersWithItems,
        });

    } catch (error: any) {
        console.error('Error fetching ops orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/ops/orders
// Update order status and final total (after shopping at bazaar)
export async function PATCH(request: NextRequest) {
    try {
        const {
            orderId,
            finalTotal,
            orderStatus,
            itemUpdates, // Array of { itemId, status }
        } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID required' },
                { status: 400 }
            );
        }

        // Update order
        if (finalTotal !== undefined || orderStatus !== undefined) {
            const updateData: any = {};
            if (finalTotal !== undefined) updateData.finalTotal = finalTotal.toString();
            if (orderStatus !== undefined) updateData.orderStatus = orderStatus;

            await db
                .update(orders)
                .set(updateData)
                .where(eq(orders.orderId, orderId));
        }

        // Update individual item statuses
        if (itemUpdates && itemUpdates.length > 0) {
            for (const item of itemUpdates) {
                await db
                    .update(orderItems)
                    .set({ status: item.status })
                    .where(eq(orderItems.itemId, item.itemId));
            }
        }

        console.log('Order updated by ops:', {
            orderId,
            finalTotal,
            orderStatus,
            itemCount: itemUpdates?.length || 0,
        });

        return NextResponse.json({
            success: true,
            message: 'Order updated successfully',
        });

    } catch (error: any) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order', details: error.message },
            { status: 500 }
        );
    }
}
