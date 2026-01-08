
import { pgTable, serial, text, integer, boolean, timestamp, decimal, pgEnum, date, uuid, bigserial, bigint } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// --- Enums ---
export const roleTypeEnum = pgEnum('role_type', [
    'admin',
    'business_owner',
    'business_manager',
    'g2g_manager',
    'g2g_operations',
    'g2g_social_media',
    'consumer',
    'driver'
]);

export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);
export const documentTypeEnum = pgEnum('document_type', ['trade_license', 'tax_cert', 'health_permit']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'unpaid', 'partial', 'paid', 'overdue', 'failed']); // Added new statuses, kept old for safety
export const paymentMethodEnum = pgEnum('payment_method_enum', ['cash', 'cheque', 'bank_transfer', 'bkash', 'nagad']);
export const paymentRecordStatusEnum = pgEnum('payment_record_status', ['pending_verification', 'verified', 'rejected']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);
export const addressTypeEnum = pgEnum('address_type', ['home', 'work', 'store', 'hq']);
export const vehicleTypeEnum = pgEnum('vehicle_type', ['bike', 'scooter', 'car']);
export const jobStatusEnum = pgEnum('job_status', ['open', 'closed']);
export const applicationStatusEnum = pgEnum('application_status', ['received', 'screening', 'hired', 'rejected']);
export const returnReasonEnum = pgEnum('return_reason', ['damaged', 'wrong_item', 'expired']);
export const returnStatusEnum = pgEnum('return_status', ['requested', 'approved', 'refunded']);
export const customerRoleEnum = pgEnum('customer_role', ['OWNER', 'MANAGER', 'CONSUMER', 'STAFF']);
export const orderItemStatusEnum = pgEnum('order_item_status', ['PENDING', 'FOUND', 'SUBSTITUTED', 'OUT_OF_STOCK']);

// --- 2.1 Core Authentication Entity: users ---
export const users = pgTable('users', {
    id: bigserial('user_id', { mode: 'number' }).primaryKey(),
    email: text('email').notNull().unique(),
    phoneNumber: text('phone_number').notNull().unique(), // Now includes country code (e.g., +8801712345678)
    passwordHash: text('password_hash').notNull(),
    role: roleTypeEnum('role_type').notNull(),
    isVerified: boolean('is_verified').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// --- 2.1.1 Centralized Address Entity: addresses ---
export const addresses = pgTable('addresses', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    streetAddress: text('street_address').notNull(),
    area: text('area').notNull(), // Critical for delivery zones (e.g., 'Gulshan 1', 'Uttara Sector 4')
    city: text('city').default('Dhaka').notNull(),
    postalCode: text('postal_code'),
    country: text('country').default('Bangladesh').notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const addressesRelations = relations(addresses, ({ many }) => ({
    businesses: many(businessProfiles),
    customers: many(customerProfiles),
}));

// --- 2.2 Customer Profile Entity: profiles_customer ---
export const customerProfiles = pgTable('profiles_customer', {
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id).primaryKey(), // Now PK instead of FK
    roleType: customerRoleEnum('role_type').default('CONSUMER'),
    employerBusinessId: bigint('employer_business_id', { mode: 'number' }).references(() => businessProfiles.businessId),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    dateOfBirth: date('date_of_birth'), // Nullable - not collected in registration
    addressId: bigint('address_id', { mode: 'number' }).references(() => addresses.id), // Link to centralized address
    phoneNumber: text('phone_number').notNull().unique(),
    email: text('email').notNull().unique(),
    nidPassportNumber: text('nid_passport_number'), // Nullable - optional field
    nidPassportImageUrl: text('nid_passport_image_url'), // Nullable - optional field
    loyaltyPoints: integer('loyalty_points').default(0),
});

export const customerProfilesRelations = relations(customerProfiles, ({ one }) => ({
    address: one(addresses, {
        fields: [customerProfiles.addressId],
        references: [addresses.id],
    }),
}));

// --- 2.3 Business Entity Profile: profiles_business ---
export const businessProfiles = pgTable('profiles_business', {
    businessId: bigserial('business_id', { mode: 'number' }).primaryKey(),
    ownerId: bigint('owner_id', { mode: 'number' }).references(() => users.id).notNull(), // Business Owner FK
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(), // Backward compatibility
    businessName: text('business_name').notNull(),
    legalName: text('legal_name').notNull(),
    addressId: bigint('address_id', { mode: 'number' }).references(() => addresses.id), // Link to centralized address
    phoneNumber: text('phone_number').notNull().unique(), // Business contact
    email: text('email').notNull().unique(), // Business email
    tradeLicenseNumber: text('trade_license_number').notNull(),
    taxCertificateNumber: text('tax_certificate_number').notNull(),
    expiryDate: date('expiry_date').notNull(),
    verificationStatus: verificationStatusEnum('verification_status').default('pending'),
    verifiedAt: timestamp('verified_at'),
    // delivery_fee: handled in zones or simple col? Spec says: base_fee (DECIMAL) in delivery_fee section, but likely variable.
    // Assuming simple base fee for now from text:
    // delivery_fee: decimal('delivery_fee'), // Leaving out as it seems to be in delivery_zones usually, but text mentioned it here too.
});

export const businessProfilesRelations = relations(businessProfiles, ({ one }) => ({
    address: one(addresses, {
        fields: [businessProfiles.addressId],
        references: [addresses.id],
    }),
}));

// --- 2.4 Entity: vendor_documents ---
export const vendorDocuments = pgTable('vendor_documents', {
    documentId: bigserial('document_id', { mode: 'number' }).primaryKey(),
    businessId: bigint('business_id', { mode: 'number' }).references(() => businessProfiles.businessId).notNull(),
    documentType: documentTypeEnum('document_type').notNull(),
    s3Url: text('s3_url').notNull(), // Stored in S3
    uploadedAt: timestamp('uploaded_at').defaultNow(),
    expiryDate: date('expiry_date'),
});

// --- 2.5 Entity: business_applications ---
export const businessApplications = pgTable('business_applications', {
    applicationId: bigserial('application_id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
    businessName: text('business_name').notNull(),
    legalName: text('legal_name').notNull(),
    addressId: bigint('address_id', { mode: 'number' }).references(() => addresses.id), // New: Link to centralized address
    phoneNumber: text('phone_number').notNull(),
    email: text('email').notNull(),
    tradeLicenseNumber: text('trade_license_number').notNull(),
    taxCertificateNumber: text('tax_certificate_number').notNull(),
    status: verificationStatusEnum('status').default('pending'),
    appliedAt: timestamp('applied_at').defaultNow(),
    reviewedAt: timestamp('reviewed_at'),
    reviewedBy: bigint('reviewed_by', { mode: 'number' }).references(() => users.id),
    rejectionReason: text('rejection_reason'),
    resubmittedAt: timestamp('resubmitted_at'), // Track when business owner resubmits after rejection
});

// --- 2.6 Entity: manager_applications ---
// Supports linking to either:
// 1. linkedApplicationId: For managers added during Step 3 of business registration (before approval)
// 2. businessId: For managers added by existing business owners from their dashboard
export const managerApplications = pgTable('manager_applications', {
    applicationId: bigserial('application_id', { mode: 'number' }).primaryKey(),
    businessOwnerId: bigint('business_owner_id', { mode: 'number' }).references(() => users.id).notNull(),
    // Nullable: will be null during Step 3, populated after business approval
    businessId: bigint('business_id', { mode: 'number' }).references(() => businessProfiles.businessId),
    // New: links to pending business application during Step 3 registration
    linkedApplicationId: bigint('linked_application_id', { mode: 'number' }).references(() => businessApplications.applicationId),
    // New: Link to centralized address for the manager
    addressId: bigint('address_id', { mode: 'number' }).references(() => addresses.id),
    managerEmail: text('manager_email').notNull(),
    managerPhone: text('manager_phone').notNull(),
    managerFirstName: text('manager_first_name').notNull(),
    managerLastName: text('manager_last_name').notNull(),
    status: verificationStatusEnum('status').default('pending'),
    appliedAt: timestamp('applied_at').defaultNow(),
    reviewedAt: timestamp('reviewed_at'),
    reviewedBy: bigint('reviewed_by', { mode: 'number' }).references(() => users.id),
    rejectionReason: text('rejection_reason'),
});

// --- 3.1 Entity: global_catalog (The Master Product List) ---
export const categories = pgTable('categories', {
    categoryId: serial('category_id').primaryKey(),
    parentId: integer('parent_id'), // Self reference, adding relation below
    name: text('name').notNull(),
    taxCode: text('tax_code'),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.categoryId],
        relationName: 'category_parent',
    }),
    children: many(categories, {
        relationName: 'category_parent',
    }),
}));

export const globalCatalog = pgTable('global_catalog', {
    globalProductId: bigserial('global_product_id', { mode: 'number' }).primaryKey(),
    skuBarcode: text('sku_barcode').unique(),
    name: text('name').notNull(),
    descriptionHtml: text('description_html'),
    categoryId: integer('category_id').references(() => categories.categoryId),
    baseUnit: text('base_unit').notNull(),
    baseWeightGrams: integer('base_weight_grams').notNull(),
    stockQuantity: integer('stock_quantity').default(0),
    baseImageUrl: text('base_image_url').notNull(),
    rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),

    // -- NEW B2B FIELDS --
    costPrice: decimal('cost_price', { precision: 10, scale: 2 }).default('0'),
    sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).default('0'),
    variantGroupId: integer('variant_group_id'),
    packSizeLabel: text('pack_size_label'),
});

// --- 4.1 Entity: orders ---
export const orders = pgTable('orders', {
    orderId: bigserial('order_id', { mode: 'number' }).primaryKey(),
    businessId: bigint('business_id', { mode: 'number' }).references(() => businessProfiles.businessId).notNull(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
    shippingAddressId: bigint('shipping_address_id', { mode: 'number' }).references(() => addresses.id).notNull(),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: text('status').default('pending').notNull(),
    paymentStatus: text('payment_status').default('unpaid').notNull(),
    paymentMethod: text('payment_method'), // e.g., 'cash', 'bank'
    poNumber: text('po_number'), // Nullable
    orderNotes: text('order_notes'), // Nullable
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 4.2 Entity: order_items ---
export const orderItems = pgTable('order_items', {
    itemId: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.orderId).notNull(),
    productId: bigint('product_id', { mode: 'number' }).references(() => globalCatalog.globalProductId).notNull(),
    productName: text('product_name').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
});

// --- 5.1 Entity: invoices ---
export const invoices = pgTable('invoices', {
    invoiceId: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.orderId).notNull(),
    invoiceNumber: text('invoice_number').unique().notNull(),
    status: text('status').default('Unpaid').notNull(),
    amountDue: decimal('amount_due', { precision: 10, scale: 2 }).notNull(),
    generatedAt: timestamp('generated_at').defaultNow().notNull(),
});

// --- 5.1.1 Entity: payments ---
export const payments = pgTable('payments', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.orderId),
    invoiceId: bigint('invoice_id', { mode: 'number' }).references(() => invoices.invoiceId),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    method: paymentMethodEnum('method').notNull(),
    transactionReference: text('transaction_reference'),
    proofImageUrl: text('proof_image_url'),
    status: paymentRecordStatusEnum('status').default('pending_verification'),
    recordedBy: bigint('recorded_by', { mode: 'number' }).references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.orderId],
    }),
    invoice: one(invoices, {
        fields: [payments.invoiceId],
        references: [invoices.invoiceId],
    }),
    recorder: one(users, {
        fields: [payments.recordedBy],
        references: [users.id],
    }),
}));

// --- 5.2 Entity: promotions ---
export const promotions = pgTable('promotions', {
    promoId: bigserial('promo_id', { mode: 'number' }).primaryKey(),
    businessId: bigint('business_id', { mode: 'number' }).references(() => businessProfiles.businessId), // Nullable for platform-wide
    code: text('code').unique(),
    discountType: discountTypeEnum('discount_type').notNull(),
    value: decimal('value', { precision: 10, scale: 2 }).notNull(),
    minOrderValue: decimal('min_order_value', { precision: 10, scale: 2 }).default('0'),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    usageLimit: integer('usage_limit'),
});

// --- 5.3 Entity: order_discounts ---
export const orderDiscounts = pgTable('order_discounts', {
    id: serial('id').primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.orderId),
    promoId: bigint('promo_id', { mode: 'number' }).references(() => promotions.promoId),
    discountAmountApplied: decimal('discount_amount_applied', { precision: 10, scale: 2 }),
});

// --- 6.1 Entity: addresses ---
// MOVED: Centralized addresses table is now defined after users table (line 42)
// The new addresses table is "dumb" - entities link TO it via foreign keys

// Add foreign key to orders for shipping address
// Note: Circular reference order in definition. Drizzle handles this purely via runtime or we define relations.
// orders.shippingAddressId references addresses.id

// --- 6.2 Entity: delivery_drivers ---
export const deliveryDrivers = pgTable('delivery_drivers', {
    driverId: bigserial('driver_id', { mode: 'number' }).primaryKey(), // Usually PK, but user said 'Links to users.user_id'. Making it PK and FK is possible.
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
    currentLocation: text('current_location'), // Geography placeholder
    isOnline: boolean('is_online').default(false),
    vehicleType: vehicleTypeEnum('vehicle_type'),
});

// --- 6.3 Entity: delivery_zones ---
export const deliveryZones = pgTable('delivery_zones', {
    zoneId: bigserial('zone_id', { mode: 'number' }).primaryKey(),
    zonePolygon: text('zone_polygon'), // Geography placeholder
    baseFee: decimal('base_fee', { precision: 10, scale: 2 }),
});

// --- 7.1 Entity: job_postings ---
export const jobPostings = pgTable('job_postings', {
    jobId: bigserial('job_id', { mode: 'number' }).primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    roleCategory: text('role_category').notNull(),
    locationId: bigint('location_id', { mode: 'number' }).references(() => addresses.id), // Link to centralized address
    status: jobStatusEnum('status').default('open'),
    salaryRange: text('salary_range'),
});

// --- 7.2 Entity: job_applications ---
export const jobApplications = pgTable('job_applications', {
    applicationId: bigserial('application_id', { mode: 'number' }).primaryKey(),
    jobId: bigint('job_id', { mode: 'number' }).references(() => jobPostings.jobId),
    applicantUserId: bigint('applicant_user_id', { mode: 'number' }).references(() => users.id),
    resumeUrl: text('resume_url').notNull(),
    coverLetter: text('cover_letter'),
    applicationStatus: applicationStatusEnum('application_status').default('received'),
    appliedAt: timestamp('applied_at').defaultNow(),
});

// --- 8.1 Entity: returns ---
export const returns = pgTable('returns', {
    returnId: bigserial('return_id', { mode: 'number' }).primaryKey(),
    subOrderId: bigint('sub_order_id', { mode: 'number' }).references(() => orders.orderId),
    productId: bigint('product_id', { mode: 'number' }).references(() => globalCatalog.globalProductId),
    reason: returnReasonEnum('reason'),
    status: returnStatusEnum('status').default('requested'),
    refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).notNull(),
});

// --- 8.3 Entity: proof_of_delivery ---
export const proofOfDelivery = pgTable('proof_of_delivery', {
    proofId: bigserial('proof_id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.orderId).notNull(),
    imageUrl: text('image_url').notNull(),
    uploadedBy: bigint('uploaded_by', { mode: 'number' }).references(() => users.id).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// --- Manager Request Entity: manager_requests ---
export const managerRequests = pgTable('manager_requests', {
    requestId: bigserial('request_id', { mode: 'number' }).primaryKey(),
    businessId: bigint('business_id', { mode: 'number' }).references(() => businessProfiles.businessId).notNull(),
    requestedBy: bigint('requested_by', { mode: 'number' }).references(() => users.id).notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phoneNumber: text('phone_number').notNull(),
    initialPassword: text('initial_password').notNull(),
    requestStatus: text('request_status').default('pending').notNull(), // pending, approved, rejected
    createdAt: timestamp('created_at').defaultNow().notNull(),
    reviewedBy: bigint('reviewed_by', { mode: 'number' }).references(() => users.id),
    reviewedAt: timestamp('reviewed_at'),
});

// --- 8.2 Entity: reviews ---
export const reviews = pgTable('reviews', {
    reviewId: bigserial('review_id', { mode: 'number' }).primaryKey(),
    productId: bigint('product_id', { mode: 'number' }).references(() => globalCatalog.globalProductId),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    imageUrl: text('image_url'),
});

// --- Shopping Lists Feature (B2B) ---
// Lists belong to businesses, not individual users
export const shoppingLists = pgTable('shopping_lists', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    businessId: bigint('business_id', { mode: 'number' })
        .references(() => businessProfiles.businessId)
        .notNull(),
    name: text('name').notNull(), // e.g., 'Weekly Restock', 'Monthly Order'
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shoppingListItems = pgTable('shopping_list_items', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    listId: bigint('list_id', { mode: 'number' })
        .references(() => shoppingLists.id)
        .notNull(),
    productId: bigint('product_id', { mode: 'number' })
        .references(() => globalCatalog.globalProductId)
        .notNull(),
    quantity: integer('quantity').default(1).notNull(),
    notes: text('notes'), // Optional notes for specific items
});

// --- Drizzle Relations for Shopping Lists ---

// Business can have many shopping lists
export const businessProfilesShoppingListsRelations = relations(businessProfiles, ({ many }) => ({
    shoppingLists: many(shoppingLists),
}));

// Shopping list belongs to one business and has many items
export const shoppingListsRelations = relations(shoppingLists, ({ one, many }) => ({
    business: one(businessProfiles, {
        fields: [shoppingLists.businessId],
        references: [businessProfiles.businessId],
    }),
    items: many(shoppingListItems),
}));

// Shopping list item belongs to one list and one product
export const shoppingListItemsRelations = relations(shoppingListItems, ({ one }) => ({
    list: one(shoppingLists, {
        fields: [shoppingListItems.listId],
        references: [shoppingLists.id],
    }),
    product: one(globalCatalog, {
        fields: [shoppingListItems.productId],
        references: [globalCatalog.globalProductId],
    }),
}));

// --- Legacy/Seed Support: products ---
// Re-added to support legacy seed scripts that reference 'products'
export const products = pgTable("products", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).default('0'),
    image: text("image"),
    category: text("category"),
    packSize: text("pack_size"),
    inStock: boolean("in_stock").default(true),
    createdAt: timestamp("created_at").defaultNow()
});
