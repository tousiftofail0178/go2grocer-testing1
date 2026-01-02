import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, users, customerProfiles } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await db
            .select({
                orderId: orders.orderId,
                createdAt: orders.createdAt,
                customerId: orders.customerId,
                customerFirstName: customerProfiles.firstName,
                customerLastName: customerProfiles.lastName,
                customerEmail: customerProfiles.email,
                totalAmountGross: orders.totalAmountGross,
                platformFee: orders.platformFee,
                paymentStatus: orders.paymentStatus,
            })
            .from(orders)
            .leftJoin(customerProfiles, eq(orders.customerId, customerProfiles.profileId))
            .orderBy(desc(orders.createdAt));

        // Format the data to match the UI needs
        const formattedOrders = result.map(order => ({
            id: order.orderId?.toString() || '',
            // Format date: "Tuesday at 09:40 pm"
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }) : 'No date',
            customer: order.customerFirstName && order.customerLastName
                ? `${order.customerFirstName} ${order.customerLastName}`
                : 'Guest',
            channel: 'Online Store',
            total: `৳${parseFloat(order.totalAmountGross || '0').toFixed(2)}`,
            payment: order.paymentStatus === 'paid' ? 'Paid' : 'Pending',
            fulfillment: 'Processing', // Need to add fulfillment status to orders table
            items: 'N/A', // Need to join with order_items
            deliveryStatus: 'Pending',
            deliveryMethod: 'Standard'
        }));

        return NextResponse.json(formattedOrders);

    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
