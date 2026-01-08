'use server';

import { db } from '@/db';
import { orders, orderItems, globalCatalog, users, customerProfiles, addresses } from '@/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { cookies } from 'next/headers';

/**
 * Get current user from cookies
 */
async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userId || !userEmail) {
        return null;
    }

    return {
        id: parseInt(userId),
        email: userEmail
    };
}

/**
 * Get previously ordered products for a business
 * Returns unique products ordered by this business, most recent first
 * Format matches shopping list items for UI reuse
 */
export async function getPreviouslyOrderedProducts(businessId: number) {
    try {
        console.log('🔍 [SERVER] getPreviouslyOrderedProducts called with businessId:', businessId);

        // 1. Get current user for authentication
        const currentUser = await getCurrentUser();
        console.log('👤 [SERVER] Current user:', currentUser);

        if (!currentUser) {
            console.error('❌ [SERVER] Not authenticated');
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 2. Fetch all order items for this business with product details
        console.log('🗄️ [SERVER] Fetching order history...');

        // Query to get order items with product details and order date
        const orderHistory = await db
            .select({
                productId: globalCatalog.globalProductId,
                product: globalCatalog,
                lastOrderedAt: orders.createdAt,
            })
            .from(orderItems)
            .innerJoin(orders, eq(orderItems.orderId, orders.orderId))
            .innerJoin(globalCatalog, eq(orderItems.productId, globalCatalog.globalProductId))
            .where(eq(orders.businessId, businessId))
            .orderBy(desc(orders.createdAt));

        console.log('📦 [SERVER] Fetched order history:', orderHistory.length, 'items');

        // 3. Get unique products (distinct by productId)
        // Keep only the most recent occurrence of each product
        const uniqueProductsMap = new Map();

        orderHistory.forEach(item => {
            if (!uniqueProductsMap.has(item.productId)) {
                uniqueProductsMap.set(item.productId, {
                    id: item.productId, // Use productId as id for shopping list format
                    quantity: 0, // Start at 0 - this is a history view
                    notes: null,
                    product: item.product,
                    lastOrderedAt: item.lastOrderedAt,
                });
            }
        });

        const uniqueProducts = Array.from(uniqueProductsMap.values());

        console.log('✅ [SERVER] Unique products found:', uniqueProducts.length);

        return {
            success: true,
            items: uniqueProducts,
        };

    } catch (error) {
        console.error('❌ [SERVER] ==== ERROR in getPreviouslyOrderedProducts ====');
        console.error('❌ [SERVER] Full error:', error);
        console.error('❌ [SERVER] Error message:', error instanceof Error ? error.message : String(error));
        console.error('❌ [SERVER] Stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('❌ [SERVER] ==========================================');

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch order history'
        };
    }
}

/**
 * Get order history (transactions) for a business
 * Returns list of orders with details for Order History page
 */
export async function getOrderHistory(businessId: number) {
    try {
        console.log('🔍 [SERVER] getOrderHistory called with businessId:', businessId);

        // 1. Get current user for authentication
        const currentUser = await getCurrentUser();
        console.log('👤 [SERVER] Current user:', currentUser);

        if (!currentUser) {
            console.error('❌ [SERVER] Not authenticated');
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 2. Fetch orders for this business with additional details
        console.log('🗄️ [SERVER] Fetching order transactions...');

        // Updated to use correct schema fields (removed Legacy fields)
        const orderHistory = await db
            .select({
                orderId: orders.orderId,
                createdAt: orders.createdAt,
                status: orders.status, // Was orderStatus
                totalAmount: orders.totalAmount, // Was totalAmountGross
                userId: orders.userId, // Was createdBy
                // customerName removed not in schema now
            })
            .from(orders)
            .where(eq(orders.businessId, businessId))
            .orderBy(desc(orders.createdAt));

        console.log('📦 [SERVER] Fetched orders:', orderHistory.length);

        //3. For each order, count the number of items
        const ordersWithDetails = await Promise.all(
            orderHistory.map(async (order) => {
                const itemCount = await db
                    .select({ count: orderItems.itemId })
                    .from(orderItems)
                    .where(eq(orderItems.orderId, order.orderId));

                return {
                    orderId: order.orderId,
                    date: order.createdAt,
                    status: order.status || 'pending',
                    totalAmount: order.totalAmount,
                    productCount: itemCount.length,
                    orderedBy: `User #${order.userId}`, // Fallback since customerName removed
                };
            })
        );

        console.log('✅ [SERVER] Order history with details:', ordersWithDetails.length);

        return {
            success: true,
            orders: ordersWithDetails,
        };

    } catch (error) {
        console.error('❌ [SERVER] ==== ERROR in getOrderHistory ====');
        console.error('❌ [SERVER] Full error:', error);
        console.error('❌ [SERVER] Error message:', error instanceof Error ? error.message : String(error));
        console.error('❌ [SERVER] Stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('❌ [SERVER] ==========================================');

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch order history'
        };
    }
}

/**
 * Get business orders with user details for Order History page
 * Joins with users and customer profiles to get the name of who placed the order
 */
export async function getBusinessOrders(businessId: number) {
    try {
        console.log('🔍 [SERVER] getBusinessOrders called with businessId:', businessId);

        // 1. Get current user for authentication
        const currentUser = await getCurrentUser();
        console.log('👤 [SERVER] Current user:', currentUser);

        if (!currentUser) {
            console.error('❌ [SERVER] Not authenticated');
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 2. Fetch orders for this business with user details AND Address
        console.log('🗄️ [SERVER] Fetching business orders with user details...');

        // Updated to use correct schema fields
        const businessOrders = await db
            .select({
                id: orders.orderId,
                referenceNumber: orders.orderId, // Will format as "Order #123" in UI
                createdAt: orders.createdAt,
                totalAmount: orders.totalAmount, // Was totalAmountGross
                status: orders.status, // Was orderStatus
                userId: orders.userId, // Was createdBy
                paymentMethod: orders.paymentMethod,

                // Profile Join
                userFirstName: customerProfiles.firstName,
                userLastName: customerProfiles.lastName,

                // Address Join (New Feature requested)
                streetAddress: addresses.streetAddress,
                city: addresses.city,
                area: addresses.area,
            })
            .from(orders)
            .leftJoin(customerProfiles, eq(orders.userId, customerProfiles.userId)) // Changed joined column to userId
            .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id)) // Added Address Join
            .where(eq(orders.businessId, businessId))
            .orderBy(desc(orders.createdAt));

        console.log('📦 [SERVER] Fetched orders:', businessOrders.length);

        // 3. For each order, count items
        const ordersWithItemCount = await Promise.all(
            businessOrders.map(async (order) => {
                const itemCountResult = await db
                    .select({ count: count() })
                    .from(orderItems)
                    .where(eq(orderItems.orderId, order.id));

                const itemCount = itemCountResult[0]?.count || 0;

                // Determine display name
                let placedByName = 'Unknown User';
                if (order.userFirstName && order.userLastName) {
                    placedByName = `${order.userFirstName} ${order.userLastName}`;
                } else if (order.userId) {
                    placedByName = `User #${order.userId}`;
                }

                // Format Address
                const shippingAddress = {
                    address: order.streetAddress || 'Business Address', // Fallback
                    city: order.city || 'Chittagong',
                    area: order.area || ''
                };

                // Fetch full items for the modal
                const items = await db
                    .select({
                        id: orderItems.itemId,
                        productName: orderItems.productName,
                        quantity: orderItems.quantity,
                        unitPrice: orderItems.unitPrice,
                        totalPrice: orderItems.totalPrice
                    })
                    .from(orderItems)
                    .where(eq(orderItems.orderId, order.id));

                return {
                    id: order.id,
                    reference_number: `Order #${order.id}`,
                    created_at: order.createdAt,
                    total_amount: order.totalAmount,
                    status: order.status || 'pending',
                    placed_by_name: placedByName,
                    item_count: items.length, // Keep item_count for the list view
                    shippingAddress: shippingAddress,
                    items: items // Return full items for the modal
                };
            })
        );

        console.log('✅ [SERVER] Orders with item counts:', ordersWithItemCount.length);

        return {
            success: true,
            orders: ordersWithItemCount,
        };

    } catch (error) {
        console.error('❌ [SERVER] ==== ERROR in getBusinessOrders ====');
        console.error('❌ [SERVER] Full error:', error);
        console.error('❌ [SERVER] Error message:', error instanceof Error ? error.message : String(error));
        console.error('❌ [SERVER] Stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('❌ [SERVER] ==========================================');

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch business orders'
        };
    }
}
