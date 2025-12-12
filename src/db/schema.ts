
import { pgTable, text, serial, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().unique(), // e.g. G2G-001
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email'),
    address: text('address'), // Added address field
    role: text('role').$type<'admin' | 'owner' | 'manager' | 'consumer' | 'b2b'>().default('consumer'),
    password: text('password'), // Will store hashed password later
    createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
    id: text('id').primaryKey(), // Using string ID to match existing data
    name: text('name').notNull(),
    price: integer('price'), // Storing as integer (e.g. cents) or just raw number if consistent
    originalPrice: integer('original_price'),
    weight: text('weight').notNull(),
    image: text('image').notNull(),
    rating: decimal('rating', { precision: 2, scale: 1 }).default('0'),
    category: text('category').notNull(),
    inStock: boolean('in_stock').default(true),
    isNew: boolean('is_new').default(false),
    discount: integer('discount'),
});

export const orders = pgTable('orders', {
    id: text('id').primaryKey(),
    userId: integer('user_id').references(() => users.id), // References internal serial ID
    total: integer('total').notNull(),
    deliveryFee: integer('delivery_fee').notNull(),
    status: text('status').notNull().default('Processing'),
    date: timestamp('date').defaultNow(),
    shippingAddress: text('shipping_address').notNull(),
    paymentMethod: text('payment_method').notNull(),
});

export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: text('order_id').references(() => orders.id),
    productId: text('product_id').references(() => products.id),
    quantity: integer('quantity').notNull(),
    priceAtPurchase: integer('price_at_purchase'),
});
