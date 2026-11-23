ALTER TYPE "public"."source_document_type" ADD VALUE 'APBD';--> statement-breakpoint
ALTER TYPE "public"."source_document_type" ADD VALUE 'LKPJ';--> statement-breakpoint
CREATE TABLE "admin_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_email" text NOT NULL,
	"aksi" text NOT NULL,
	"target" text NOT NULL,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "admin_rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "admin_audit" ADD CONSTRAINT "admin_audit_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE set null ON UPDATE no action;