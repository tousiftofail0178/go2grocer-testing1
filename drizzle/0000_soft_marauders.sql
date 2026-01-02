CREATE TYPE "public"."address_type" AS ENUM('home', 'work', 'store', 'hq');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('received', 'screening', 'hired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('trade_license', 'tax_cert', 'health_permit');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."return_reason" AS ENUM('damaged', 'wrong_item', 'expired');--> statement-breakpoint
CREATE TYPE "public"."return_status" AS ENUM('requested', 'approved', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('admin', 'business_owner', 'business_manager', 'g2g_manager', 'g2g_operations', 'g2g_social_media', 'consumer', 'driver');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('bike', 'scooter', 'car');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "addresses" (
	"address_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"address_type" "address_type",
	"street_line_1" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"geo_location" text
);
--> statement-breakpoint
CREATE TABLE "profiles_business" (
	"business_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"business_name" text NOT NULL,
	"legal_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text NOT NULL,
	"trade_license_number" text NOT NULL,
	"tax_certificate_number" text NOT NULL,
	"expiry_date" date NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending',
	"verified_at" timestamp,
	CONSTRAINT "profiles_business_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "profiles_business_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"name" text NOT NULL,
	"tax_code" text
);
--> statement-breakpoint
CREATE TABLE "profiles_customer" (
	"profile_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date,
	"phone_number" text NOT NULL,
	"email" text NOT NULL,
	"nid_passport_number" text,
	"nid_passport_image_url" text,
	"loyalty_points" integer DEFAULT 0,
	CONSTRAINT "profiles_customer_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_customer_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "profiles_customer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "delivery_drivers" (
	"driver_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"current_location" text,
	"is_online" boolean DEFAULT false,
	"vehicle_type" "vehicle_type"
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"zone_id" bigserial PRIMARY KEY NOT NULL,
	"zone_polygon" text,
	"base_fee" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "global_catalog" (
	"global_product_id" bigserial PRIMARY KEY NOT NULL,
	"sku_barcode" text,
	"name" text NOT NULL,
	"description_html" text,
	"category_id" integer,
	"base_unit" text NOT NULL,
	"base_weight_grams" integer NOT NULL,
	"stock_quantity" integer DEFAULT 0,
	"base_image_url" text NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	CONSTRAINT "global_catalog_sku_barcode_unique" UNIQUE("sku_barcode")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"invoice_id" bigserial PRIMARY KEY NOT NULL,
	"invoice_number" text,
	"order_id" bigint,
	"business_id" bigint,
	"customer_id" bigint,
	"tax_amount" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"pdf_url" text,
	"generated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"application_id" bigserial PRIMARY KEY NOT NULL,
	"job_id" bigint,
	"applicant_user_id" bigint,
	"resume_url" text NOT NULL,
	"cover_letter" text,
	"application_status" "application_status" DEFAULT 'received',
	"applied_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"job_id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"role_category" text NOT NULL,
	"location_id" bigint,
	"status" "job_status" DEFAULT 'open',
	"salary_range" text
);
--> statement-breakpoint
CREATE TABLE "order_discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" bigint,
	"promo_id" bigint,
	"discount_amount_applied" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" bigserial PRIMARY KEY NOT NULL,
	"customer_id" bigint,
	"business_id" bigint,
	"shipping_address_id" bigint,
	"total_amount_gross" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"promo_id" bigserial PRIMARY KEY NOT NULL,
	"business_id" bigint,
	"code" text,
	"discount_type" "discount_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"min_order_value" numeric(10, 2) DEFAULT '0',
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"usage_limit" integer,
	CONSTRAINT "promotions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "returns" (
	"return_id" bigserial PRIMARY KEY NOT NULL,
	"sub_order_id" bigint,
	"product_id" bigint,
	"reason" "return_reason",
	"status" "return_status" DEFAULT 'requested',
	"refund_amount" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"review_id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint,
	"user_id" bigint,
	"rating" integer NOT NULL,
	"comment" text,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"phone_country_code" text NOT NULL,
	"phone_number" text NOT NULL,
	"password_hash" text NOT NULL,
	"role_type" "role_type" NOT NULL,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "vendor_documents" (
	"document_id" bigserial PRIMARY KEY NOT NULL,
	"business_id" bigint NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_url" text NOT NULL,
	"expiry_date" date NOT NULL,
	"verified_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_business" ADD CONSTRAINT "profiles_business_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_customer" ADD CONSTRAINT "profiles_customer_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_drivers" ADD CONSTRAINT "delivery_drivers_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "global_catalog" ADD CONSTRAINT "global_catalog_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_profiles_business_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."profiles_business"("business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_profiles_customer_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles_customer"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_job_postings_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("job_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_applicant_user_id_users_user_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_location_id_addresses_address_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."addresses"("address_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_promo_id_promotions_promo_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promotions"("promo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_profiles_customer_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles_customer"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_business_id_profiles_business_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."profiles_business"("business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_business_id_profiles_business_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."profiles_business"("business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_sub_order_id_orders_order_id_fk" FOREIGN KEY ("sub_order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_product_id_global_catalog_global_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."global_catalog"("global_product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_global_catalog_global_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."global_catalog"("global_product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_business_id_profiles_business_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."profiles_business"("business_id") ON DELETE no action ON UPDATE no action;