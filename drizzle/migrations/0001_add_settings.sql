CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"company_legal_name" text DEFAULT 'Grupo Uxea Soluciones S.L.' NOT NULL,
	"company_trade_name" text,
	"company_cif" text DEFAULT '' NOT NULL,
	"company_email" "citext" DEFAULT '' NOT NULL,
	"company_phone" text,
	"company_website" text,
	"company_logo_url" text,
	"company_address_line1" text DEFAULT '' NOT NULL,
	"company_address_line2" text,
	"company_postal_code" text DEFAULT '' NOT NULL,
	"company_city" text DEFAULT '' NOT NULL,
	"company_province" text DEFAULT '' NOT NULL,
	"company_country" text DEFAULT 'ES' NOT NULL,
	"bank_iban" text,
	"bank_swift_bic" text,
	"bank_name" text,
	"invoice_prefix" text DEFAULT 'UXE' NOT NULL,
	"invoice_series" text DEFAULT 'A' NOT NULL,
	"invoice_next_number" integer DEFAULT 1 NOT NULL,
	"invoice_number_padding" integer DEFAULT 5 NOT NULL,
	"invoice_footer" text,
	"invoice_default_vat_rate" numeric(5, 2) DEFAULT '21.00' NOT NULL,
	"invoice_default_payment_terms_days" integer DEFAULT 30 NOT NULL,
	"email_from_name" text DEFAULT 'Uxea Soluciones' NOT NULL,
	"email_from_address" "citext" DEFAULT 'no-reply@uxea.net' NOT NULL,
	"email_reply_to" "citext",
	"email_footer_html" text,
	"email_templates" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_singleton_chk" CHECK (id = 1);
--> statement-breakpoint
INSERT INTO "settings" ("id") VALUES (1) ON CONFLICT (id) DO NOTHING;