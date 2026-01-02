# Content Assessment Buffer

<!-- 
2.1 Core Authentication Entity: users
This table serves as the central directory for all actors (Customers, Vendors, Admins, Drivers). It manages access credentials and account status, decoupling authentication from the business logic of the profile.
Column Name	Data Type	Constraints	Architectural Reasoning
user_id	BIGINT	PRIMARY KEY, AUTO_INCREMENT	Internal reference ID. Uses BIGINT to prevent integer overflow as the user base scales into millions.
public_id	UUID	UNIQUE, NOT NULL	External-facing ID for APIs. Prevents "enumeration attacks" where competitors guess user counts by incrementing IDs.12
email	VARCHAR(255)	UNIQUE, NOT NULL	Primary login identifier. Indexed for fast lookup during authentication.
phone_country_code	VARCHAR(5)	NOT NULL	stored separately to normalize phone numbers globally.
phone_number	VARCHAR(20)	UNIQUE, NOT NULL	Critical for SMS verification (OTP) and delivery coordination.
password_hash	VARCHAR(255)	NOT NULL	Stores the Bcrypt or Argon2 hash. Raw passwords are never stored.
role_type	ENUM	“Admin” “Business Owner” “Business Manager” “G2G Manager” “G2G Operations” “G2G Social Media”	Discriminator column used to route the user to the correct profile table upon login.13
is_verified	BOOLEAN	DEFAULT FALSE	enforced check to prevent fake account creation.
created_at	TIMESTAMPTZ	DEFAULT NOW()	Audit timestamp.

2.2 Customer Profile Entity: profiles_customer
This table explicitly maps to the Customer entity in the user's sketch. It extends the users table with consumer-specific fields.
Column Name	Data Type	Constraints	Architectural Reasoning
profile_id	BIGINT	PRIMARY KEY	Unique identifier for the profile.
user_id	BIGINT	FOREIGN KEY, UNIQUE	Links 1:1 to the users table. Deleting a user cascades to profile deletion (or archiving).
first_name	VARCHAR(100)	NOT NULL	Separated from Last Name for personalized communication.
last_name	VARCHAR(100)	NOT NULL	Essential for formal identification.
date_of_birth	DATE	NULL	Required for age-restricted items (alcohol/tobacco) and user verification.
address			
phone_number	VARCHAR(20)	UNIQUE, NOT NULL	Critical for SMS verification (OTP) and delivery coordination.
email	VARCHAR(255)	UNIQUE, NOT NULL	Primary login identifier. Indexed for fast lookup during authentication.
nid_passport_number	TEXT	ENCRYPTED	From User Draft. Stores sensitive government ID. Must be encrypted at rest to comply with privacy laws.
nid_passport_image_url	TEXT	NULL	From User Draft. URL to a secure, private S3 bucket containing the scanned ID document.
loyalty_points	INTEGER	DEFAULT 0	Gamification element to drive retention.

 
2.3 Business Entity Profile: profiles_business
Mapping to the Business Entity sketch, this table handles the complexities of B2B identity, specifically the legal documentation required to operate on the platform.
Column Name	Data Type	Constraints	Architectural Reasoning
business_id	BIGINT	PRIMARY KEY	Maps to User's "ID" in Business Entity.
user_id	BIGINT	FOREIGN KEY	Links to the users account of the business owner/manager.
business_name	VARCHAR(255)	NOT NULL	The public trading name displayed on the storefront.
legal_name	VARCHAR(255)	NOT NULL	The entity name used for tax and invoicing purposes.
address			
phone_number	VARCHAR(20)	UNIQUE, NOT NULL	Critical for SMS verification (OTP) and delivery coordination.
email	VARCHAR(255)	UNIQUE, NOT NULL	Primary login identifier. Indexed for fast lookup during authentication.
trade_license_number	VARCHAR(100)	NOT NULL	From User Draft. Critical KYB field to ensure vendor legitimacy.
tax_certificate_number	VARCHAR(100)	NOT NULL	From User Draft. Required for automated tax calculation and invoice generation.
expiry_date	DATE	NOT NULL	Triggers automated email notifications to vendors when their license is about to expire.
verification_status	ENUM	'PENDING', 'VERIFIED', 'REJECTED'	Controls the visibility of the store. A store cannot go live until this is 'VERIFIED'.
verified_at	TIMESTAMPTZ	NULL	Audit trail of when and who verified the document.
delivery_fee	•	base_fee (DECIMAL): The cost to deliver in this zone.
		
 
2.4 Entity: vendor_documents
To robustly handle the Tax Certificate and Trade License requirements (and their potential expiration), a dedicated document management table is superior to simple columns on the profile table.
Column Name	Data Type	Constraints	Architectural Reasoning
document_id	BIGINT	PRIMARY KEY	Internal ID.
business_id	BIGINT	FOREIGN KEY	Links to the vendor.
document_type	ENUM	'TRADE_LICENSE', 'TAX_CERT', 'HEALTH_PERMIT'	Categorizes the upload for compliance checks.
file_url	TEXT	NOT NULL	Secure storage link.
expiry_date	DATE	NOT NULL	Triggers automated email notifications to vendors when their license is about to expire.
verified_at	TIMESTAMPTZ	NULL	Audit trail of when and who verified the document.

 
3.1 Entity: global_catalog (The Master Product List)
This table acts as the standardized source of truth for product metadata, ensuring consistency across the platform.
Column Name	Data Type	Constraints	Architectural Reasoning
global_product_id	BIGINT	PRIMARY KEY	Maps to User's "SKU/ID".
sku_barcode	VARCHAR(50)	UNIQUE, INDEX	Universal product code (UPC/EAN) for scanning and inventory lookup.
name	VARCHAR(255)	NOT NULL	Standardized name (e.g., "Heinz Tomato Ketchup").
description_html	TEXT	NULL	Maps to User's "Details". Rich text description shared by all vendors.
category_id	INT	FOREIGN KEY	Maps to User's "Category". hierarchical classification.
base_unit	VARCHAR(20)	NOT NULL	Maps to User's "Unit/Size/Weight". (e.g., 'bottle', 'kg', 'pack').
base_weight_grams	INT	NOT NULL	Essential for calculating shipping costs automatically.
stock_quantity	INT	DEFAULT 0	Real-time stock level. Needs pessimistic locking during checkout.
base_image_url	TEXT	NOT NULL	Maps to User's "Image". High-quality canonical image.
rating			
source			

3.3 Entity: categories
Column Name	Data Type	Constraints	Architectural Reasoning
category_id	INT	PRIMARY KEY	
parent_id	INT	FOREIGN KEY	Self-referencing key to allow infinite nesting (e.g., Produce -> Fruit -> Citrus).
name	VARCHAR(100)	NOT NULL	Category name.
tax_code	VARCHAR(50)	NULL	Specific tax rules for this category (e.g., essentials might be tax-free).

4.1 Entity: orders (The Transaction Wrapper)
This represents the customer's checkout session. It groups the sub-orders together.
Column Name	Data Type	Constraints	Architectural Reasoning
order_id	BIGINT	PRIMARY KEY	Maps to User's "Orders -> ID".
customer_id	BIGINT	FOREIGN KEY	Maps to User's "Customer_ID".
business_id	BIGINT	PRIMARY KEY	Maps to User's "ID" in Business Entity.
shipping_address_id	BIGINT	FOREIGN KEY	Maps to User's "Shipping Address". Links to an address table to avoid data duplication.
total_amount_gross	DECIMAL(10,2)	NOT NULL	Total value charged to the customer's card.
platform_fee	DECIMAL(10,2)	NOT NULL	The fee charged by Go2Grocer to the customer.
payment_status	ENUM	'PENDING', 'PAID', 'FAILED'	High-level financial status.
created_at	TIMESTAMPTZ	NOT NULL	Maps to User's "Date/Time".

 
5.1 Entity: invoices
Maps directly to User's "Invoices" table. An invoice is a legal document snapshot of an order. It should not change even if the order status changes.
Column Name	Data Type	Constraints	Architectural Reasoning
invoice_id	BIGINT	PRIMARY KEY	
invoice_number	VARCHAR(50)	UNIQUE	Sequential, gapless number required for tax compliance (e.g., INV-2024-0001).
order_id	BIGINT	FOREIGN KEY	Maps to User's "Order_ID".
business_id	BIGINT	FOREIGN KEY	Maps to User's "Business_ID".
customer_id	BIGINT	FOREIGN KEY	Maps to User's "Customer_ID".
tax_amount	DECIMAL(10,2)	NOT NULL	The calculated tax component.
delivery_fee			
total_amount	DECIMAL(10,2)	NOT NULL	Final billed amount.
pdf_url	TEXT	NULL	Link to the generated PDF file stored in cloud storage.
generated_at	TIMESTAMPTZ	DEFAULT NOW()	

5.2 Entity: promotions (Discounts)
Expanding on the User's "Discounts" table, we need a robust engine that handles both coupon codes and automated catalogue discounts.
Column Name	Data Type	Constraints	Architectural Reasoning
promo_id	BIGINT	PRIMARY KEY	Maps to User's "Discount_ID".
business_id	BIGINT	FOREIGN KEY	Nullable. If NULL, it's a platform-wide coupon. If set, valid only for that vendor.
code	VARCHAR(50)	UNIQUE, INDEX	The string entered by the user (e.g., "FREESHIP").
discount_type	ENUM	'PERCENTAGE', 'FIXED'	Defines logic.
value	DECIMAL(10,2)	NOT NULL	The amount (e.g., 10.00 or 15.00).
min_order_value	DECIMAL(10,2)	DEFAULT 0	Condition for usage.
start_date	TIMESTAMPTZ	NOT NULL	Validity window start.
end_date	TIMESTAMPTZ	NOT NULL	Validity window end.
usage_limit	INT	DEFAULT NULL	Max total uses globally.

5.3 Entity: order_discounts (Linking Table)
Tracks which discount was applied to which order for auditing.
•	order_id (FK)
•	promo_id (FK)
•	discount_amount_applied (DECIMAL)

6.1 Entity: addresses
This table normalizes address data for Customers, Vendors, and Warehouses.
Column Name	Data Type	Constraints	Architectural Reasoning
address_id	BIGINT	PRIMARY KEY	
user_id	BIGINT	FOREIGN KEY	The owner of the address.
address_type	ENUM	'HOME', 'WORK', 'STORE', 'HQ'	
street_line_1	TEXT	NOT NULL	
city	VARCHAR(100)	NOT NULL	
postal_code	VARCHAR(20)	NOT NULL	
geo_location	GEOGRAPHY(POINT, 4326)	INDEX	Critical geospatial field. Uses PostGIS to store exact Lat/Long. Enables queries like "Find vendors within 5km".7

6.2 Entity: delivery_drivers
This table manages the workforce on wheels.
•	driver_id (PK) -> Links to users.user_id.
•	current_location (GEOGRAPHY): Updated every few seconds via API.
•	is_online (BOOLEAN): Availability toggle.   
•	vehicle_type (ENUM): 'BIKE', 'SCOOTER', 'CAR'. Affects route planning and capacity.
6.3 Entity: delivery_zones
Defines the polygons (areas) where delivery is available.
•	zone_id (PK)
•	zone_polygon (GEOGRAPHY): A shape definition of the service area.
•	base_fee (DECIMAL): The cost to deliver in this zone.
7. Human Capital: Jobs & Recruitment Module
The user explicitly requested Jobs and Applications tables. This suggests Go2Grocer plans to hire its own fleet or staff directly, acting as a gig-economy employer. This requires an embedded Applicant Tracking System (ATS).
7.1 Entity: job_postings
Maps to User's "Jobs" table.
Column Name	Data Type	Constraints	Architectural Reasoning
job_id	BIGINT	PRIMARY KEY	Maps to User's "Jobs -> ID".
title	VARCHAR(255)	NOT NULL	e.g., "Warehouse Packer", "Delivery Rider".
description	TEXT	NOT NULL	Maps to User's "Description".
role_category	VARCHAR(100)	NOT NULL	Maps to User's "Role".
location_id	BIGINT	FOREIGN KEY	Maps to User's "Location". Links to addresses or delivery_zones.
status	ENUM	'OPEN', 'CLOSED'	
salary_range	VARCHAR(100)	NULL	.20
7.2 Entity: job_applications
Maps to User's "Applications" table.
Column Name	Data Type	Constraints	Architectural Reasoning
application_id	BIGINT	PRIMARY KEY	
job_id	BIGINT	FOREIGN KEY	The opening being applied for.
applicant_user_id	BIGINT	FOREIGN KEY	The user applying.
resume_url	TEXT	NOT NULL	Link to uploaded CV.
cover_letter	TEXT	NULL	
application_status	ENUM	'RECEIVED', 'SCREENING', 'HIRED', 'REJECTED'	Tracks the hiring workflow.21
applied_at	TIMESTAMPTZ	DEFAULT NOW()	
________________________________________
8. Customer Service: Returns & Feedback
8.1 Entity: returns
Maps directly to User's "Returns" table.
Column Name	Data Type	Constraints	Architectural Reasoning
return_id	BIGINT	PRIMARY KEY	
sub_order_id	BIGINT	FOREIGN KEY	Maps to User's "Order_ID". Note: Returns link to the Sub-Order (Vendor level), not the global order.
product_id	BIGINT	FOREIGN KEY	Maps to User's "Product_ID". The specific item being returned.
reason	ENUM	'DAMAGED', 'WRONG_ITEM', 'EXPIRED'	Structured data for analytics.
status	ENUM	'REQUESTED', 'APPROVED', 'REFUNDED'	Workflow state.
refund_amount	DECIMAL(10,2)	NOT NULL	
8.2 Entity: reviews
Links to the User's "Rating" field in Products, but effectively normalizes it.
•	review_id (PK)
•	product_id (FK)
•	user_id (FK)
•	rating (INT): 1-5 stars.
•	comment (TEXT)
•	image_url (TEXT): User photo of the product.



-->
