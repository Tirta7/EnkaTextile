CREATE TABLE "product_rolls" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"barcode" text NOT NULL,
	"original_length" numeric(12, 4) DEFAULT '0' NOT NULL,
	"current_length" numeric(12, 4) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_rolls_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "return_exchanged_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"return_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"roll_id" integer,
	"rolls" numeric(12, 4) DEFAULT '0' NOT NULL,
	"meters" numeric(12, 4) DEFAULT '0' NOT NULL,
	"price_per_meter" numeric(15, 2) DEFAULT '0' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_returned_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"return_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"roll_id" integer,
	"rolls" numeric(12, 4) DEFAULT '0' NOT NULL,
	"meters" numeric(12, 4) DEFAULT '0' NOT NULL,
	"price_per_meter" numeric(15, 2) DEFAULT '0' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"return_number" text NOT NULL,
	"type" text NOT NULL,
	"sale_id" integer,
	"purchase_id" integer,
	"customer_id" integer,
	"supplier_id" integer,
	"total_returned_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_exchanged_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"difference_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"payment_status" text DEFAULT 'lunas' NOT NULL,
	"cash_refunded" numeric(15, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'selesai' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "roll_stock" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "roll_stock" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "meter_stock" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "meter_stock" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "min_stock" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "min_stock" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_items" ALTER COLUMN "rolls" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "purchase_items" ALTER COLUMN "rolls" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "purchase_items" ALTER COLUMN "meters" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "purchase_items" ALTER COLUMN "meters" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "rolls" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "rolls" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "meters" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "meters" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "stock_mutations" ALTER COLUMN "rolls" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "stock_mutations" ALTER COLUMN "rolls" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "stock_mutations" ALTER COLUMN "meters" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "stock_mutations" ALTER COLUMN "meters" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "barcode" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "primary_unit" text DEFAULT 'METER' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "secondary_unit" text DEFAULT 'ROLL' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cost_price_per_meter" numeric(15, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cost_price_per_roll" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "roll_id" integer;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "roll_id" integer;--> statement-breakpoint
ALTER TABLE "stock_mutations" ADD COLUMN "roll_id" integer;--> statement-breakpoint
ALTER TABLE "product_rolls" ADD CONSTRAINT "product_rolls_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_exchanged_items" ADD CONSTRAINT "return_exchanged_items_return_id_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_exchanged_items" ADD CONSTRAINT "return_exchanged_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_exchanged_items" ADD CONSTRAINT "return_exchanged_items_roll_id_product_rolls_id_fk" FOREIGN KEY ("roll_id") REFERENCES "public"."product_rolls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_returned_items" ADD CONSTRAINT "return_returned_items_return_id_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_returned_items" ADD CONSTRAINT "return_returned_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_returned_items" ADD CONSTRAINT "return_returned_items_roll_id_product_rolls_id_fk" FOREIGN KEY ("roll_id") REFERENCES "public"."product_rolls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_roll_id_product_rolls_id_fk" FOREIGN KEY ("roll_id") REFERENCES "public"."product_rolls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_roll_id_product_rolls_id_fk" FOREIGN KEY ("roll_id") REFERENCES "public"."product_rolls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_mutations" ADD CONSTRAINT "stock_mutations_roll_id_product_rolls_id_fk" FOREIGN KEY ("roll_id") REFERENCES "public"."product_rolls"("id") ON DELETE no action ON UPDATE no action;