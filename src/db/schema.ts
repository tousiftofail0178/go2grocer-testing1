
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
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed']);
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

// --- 2.2 Customer Profile Entity: profiles_customer ---
export const customerProfiles = pgTable('profiles_customer', {
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id).primaryKey(), // Now PK instead of FK
    roleType: customerRoleEnum('role_type').default('CONSUMER'),
    employerBusinessId: bigint('employer_business_id', { mode: 'number' }).references(() => businessProfiles.businessId),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    dateOfBirth: date('date_of_birth'), // Nullable - not collected in registration
    // address: handled in addresses table
    phoneNumber: text('phone_number').notNull().unique(),
    email: text('email').notNull().unique(),
    nidPassportNumber: text('nid_passport_number'), // Nullable - optional field
    nidPassportImageUrl: text('nid_passport_image_url'), // Nullable - optional field
    loyaltyPoints: integer('loyalty_points').default(0),
});

// --- 2.3 Business Entity Profile: profiles_business ---
export const businessProfiles = pgTable('profiles_business', {
    businessId: bigserial('business_id', { mode: 'number' }).primaryKey(),
    ownerId: bigint('owner_id', { mode: 'number' }).references(() => users.id).notNull(), // Business Owner FK
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(), // Backward compatibility
    businessName: text('business_name').notNull(),
    legalName: text('legal_name').notNull(),
    // address: handled in addresses table
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
// Note: Spec says 'shipping_address_id' links to address table
export const orders = pgTable('orders', {
    orderId: bigserial('order_id', { mode: 'number' }).primaryKey(),
    customerId: bigint('customer_id', { mode: 'number' }).references(() => customerProfiles.profileId),
    businessId: bigint('business_id', { mode: 'number' }).references(() => businessProfiles.businessId),
    createdBy: bigint('created_by', { mode: 'number' }).references(() => customerProfiles.profileId),
    shippingAddressId: bigint('shipping_address_id', { mode: 'number' }),
    estimatedTotal: decimal('estimated_total', { precision: 10, scale: 2 }),
    finalTotal: decimal('final_total', { precision: 10, scale: 2 }),
    totalAmountGross: decimal('total_amount_gross', { precision: 10, scale: 2 }).notNull(),
    platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    // New fields for full e-commerce support
    orderStatus: text('order_status').default('pending'), // pending, processing, delivered, cancelled
    deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('0'),
    deliveryAddress: text('delivery_address'),
    customerName: text('customer_name'),
    customerPhone: text('customer_phone'),
    paymentMethod: text('payment_method').default('cod'), // cod, bkash, card
});

// --- 4.2 Entity: order_items (Missing from original spec but necessary) ---
export const orderItems = pgTable('order_items', {
    itemId: bigserial('item_id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.orderId).notNull(),
    productId: bigint('product_id', { mode: 'number' }).references(() => globalCatalog.globalProductId).notNull(),
    quantity: integer('quantity').notNull(),
    priceAtPurchase: decimal('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
    productName: text('product_name').notNull(),
    status: orderItemStatusEnum('status').default('PENDING'),
});

// --- 5.1 Entity: invoices ---
export const invoices = pgTable('invoices', {
    invoiceId: bigserial('invoice_id', { mode: 'number' }).primaryKey(),
    invoiceNumber: text('invoice_number').unique(), // INV-2024-0001
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.orderId),
    businessId: bigint('business_id', { mode: 'number' }).references(() => businessProfiles.businessId),
    customerId: bigint('customer_id', { mode: 'number' }).references(() => customerProfiles.profileId),
    taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    pdfUrl: text('pdf_url'),
    generatedAt: timestamp('generated_at').defaultNow(),
});

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
export const addresses = pgTable('addresses', {
    addressId: bigserial('address_id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id),
    addressType: addressTypeEnum('address_type'),
    streetLine1: text('street_line_1').notNull(),
    city: text('city').notNull(),
    postalCode: text('postal_code').notNull(),
    // geoLocation: GEOGRAPHY(POINT, 4326) - Requires PostGIS extension.
    // For now, storing as separate lat/long or json if extension not active, but User requested GEOGRAPHY.
    // Drizzle has geometry types but needs setup.
    // Fallback to simpler representation to ensure build passes without 'drizzle-orm/postgis' package if missing.
    // We will assume lat/long columns for MVP or basic Point type if standard.
    // Using simple text for 'POINT(lat long)' or custom type to avoid build errors if PostGIS types aren't explicitly imported
    // or if the user env doesn't support it immediately. Use text for safety in this pass.
    geoLocation: text('geo_location'), // Placeholder for PostGIS GEOGRAPHY(POINT, 4326)
});

// Add foreign key to orders for shipping address
// Note: Circular reference order in definition. Drizzle handles this purely via runtime or we define relations.
// orders.shippingAddressId references addresses.addressId

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
    locationId: bigint('location_id', { mode: 'number' }).references(() => addresses.addressId), // Assuming links to address
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
