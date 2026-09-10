CREATE TABLE "license_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"license_key" text NOT NULL,
	"is_valid" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"cached_at" timestamp DEFAULT now() NOT NULL,
	"days_left" integer,
	"store_name" text
);
--> statement-breakpoint
ALTER TABLE "receivables" ALTER COLUMN "customer_id" DROP NOT NULL;