
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, globalCatalog, customerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const orderIdNum = parseInt(orderId);

        // Fetch order details with customer profile
        const orderResult = await db
            .select({
                order: orders,
                customer: customerProfiles,
            })
            .from(orders)
            .leftJoin(customerProfiles, eq(orders.userId, customerProfiles.userId))
            .where(eq(orders.orderId, orderIdNum))
            .limit(1);

        if (orderResult.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const { order, customer } = orderResult[0];

        // Fetch order items with product details
        const itemsResult = await db
            .select({
                item: orderItems,
                product: globalCatalog,
            })
            .from(orderItems)
            .leftJoin(globalCatalog, eq(orderItems.productId, globalCatalog.globalProductId))
            .where(eq(orderItems.orderId, orderIdNum));

        // Format response
        const formattedOrder = {
            id: order.orderId.toString(),
            date: order.createdAt,
            email: customer?.email || 'No email',
            phone: customer?.phoneNumber || 'No phone',
            shippingAddress: 'Address lookup needed', // TODO: Join with addresses table
            billingAddress: 'Same as shipping',
            status: 'Processing',
            paymentMethod: order.paymentStatus === 'paid' ? 'Paid' : 'Pending',
            total: parseFloat(order.totalAmount),
            subtotal: parseFloat(order.totalAmount), // Assuming no tax/fee logic yet
            deliveryFee: 0,
            platformFee: 0,
            discount: 0,
            items: itemsResult.map(({ item, product }) => ({
                id: item.itemId.toString(),
                name: product?.name || 'Unknown Product',
                sku: product?.skuBarcode || 'N/A',
                price: parseFloat(item.unitPrice),
                quantity: item.quantity,
                image: product?.baseImageUrl,
                total: parseFloat(item.totalPrice)
            })),
            customer: {
                id: customer?.userId,
                name: customer ? `${customer.firstName} ${customer.lastName}` : 'No customer',
                ordersCount: 1,
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
            .where(eq(orders.orderId, parseInt(orderId)));

        return NextResponse.json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
