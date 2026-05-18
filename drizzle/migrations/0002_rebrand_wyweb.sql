-- Rebrand Uxea Soluciones → Wyweb
-- Migra el enum brand (uxea-soluciones/wyweb/uxea-cloud → wyweb)
-- y service_category (connectivity/network/iot/voip/maintenance →
-- web-design/saas/ecommerce/seo/maintenance + branding nuevo).

-- 1) customers.brand → todos a 'wyweb'
ALTER TABLE "customers" ALTER COLUMN "brand" SET DATA TYPE text;--> statement-breakpoint
UPDATE "customers" SET "brand" = 'wyweb' WHERE "brand" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "brand" SET DEFAULT 'wyweb'::text;--> statement-breakpoint
DROP TYPE "public"."brand";--> statement-breakpoint
CREATE TYPE "public"."brand" AS ENUM('wyweb');--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "brand" SET DEFAULT 'wyweb'::"public"."brand";--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "brand" SET DATA TYPE "public"."brand" USING "brand"::"public"."brand";--> statement-breakpoint

-- 2) services.category → mapeo desde los antiguos valores
ALTER TABLE "services" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
UPDATE "services" SET "category" = CASE
  WHEN "category" = 'connectivity' THEN 'web-design'
  WHEN "category" = 'network' THEN 'saas'
  WHEN "category" = 'iot' THEN 'ecommerce'
  WHEN "category" = 'voip' THEN 'seo'
  WHEN "category" = 'maintenance' THEN 'maintenance'
  WHEN "category" IN ('web-design','saas','ecommerce','seo','maintenance','branding') THEN "category"
  ELSE 'web-design'
END;--> statement-breakpoint
DROP TYPE "public"."service_category";--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('web-design', 'saas', 'ecommerce', 'seo', 'maintenance', 'branding');--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "category" SET DATA TYPE "public"."service_category" USING "category"::"public"."service_category";
