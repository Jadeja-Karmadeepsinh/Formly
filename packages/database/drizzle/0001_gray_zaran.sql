ALTER TABLE "form_versions" ALTER COLUMN "published_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "form_versions" ALTER COLUMN "published_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "published_version_id" uuid;--> statement-breakpoint
ALTER TABLE "form_versions" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_published_version_id_form_versions_id_fk" FOREIGN KEY ("published_version_id") REFERENCES "public"."form_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "forms_published_version_id_idx" ON "forms" USING btree ("published_version_id");--> statement-breakpoint
CREATE INDEX "form_versions_form_id_created_at_idx" ON "form_versions" USING btree ("form_id","created_at");