ALTER TABLE "categories" ADD COLUMN "primary_unit" text DEFAULT 'METER' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "secondary_unit" text DEFAULT 'ROLL' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "cost_price_per_meter" numeric(15, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "price_per_meter" numeric(15, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "cost_price_per_roll" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "price_per_roll" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_invoice_number_unique" UNIQUE("invoice_number");