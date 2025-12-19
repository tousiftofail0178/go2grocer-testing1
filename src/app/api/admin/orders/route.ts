import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, users } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await db
            .select({
                id: orders.id,
                date: orders.date,
                customer: users.name,
                email: users.email,
                total: orders.total,
                status: orders.status,
                paymentMethod: orders.paymentMethod,
                deliveryFee: orders.deliveryFee,
                // Add more fields if needed
            })
            .from(orders)
            .leftJoin(users, eq(orders.userId, users.id))
            .orderBy(desc(orders.date));


        // Format the data to match the UI needs
        const formattedOrders = result.map(order => ({
            id: order.id,
            // Format date: "Tuesday at 09:40 pm"
            date: order.date ? new Date(order.date).toLocaleDateString('en-US', {
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }) : 'No date',
            // If no customer (guest checkout?), fallback
            customer: order.customer || 'No customer',
            channel: 'Online Store', // Hardcoded for now as schema doesn't have it
            total: `৳${(order.total / 100).toFixed(2)}`, // Assuming cents
            payment: 'Paid', // Logic for payment status needed if not in DB
            fulfillment: order.status, // Using status column for fulfillment
            items: 'N/A', // Need to join with orderItems for accurate count, skipping for speed
            deliveryStatus: 'Shipping', // Logic needed
            deliveryMethod: 'Standard'
        }));

        return NextResponse.json(formattedOrders);

    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
