ALTER TABLE "form_submissions" DROP CONSTRAINT "form_submissions_started_before_submitted_check";--> statement-breakpoint
ALTER TABLE "form_submissions" ALTER COLUMN "started_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "form_submissions" ALTER COLUMN "started_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "form_submissions" ALTER COLUMN "submitted_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "form_submissions" ALTER COLUMN "submitted_at" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "form_submissions_form_started_at_idx" ON "form_submissions" USING btree ("form_id","started_at");--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_started_before_submitted_check" CHECK ("form_submissions"."submitted_at" IS NULL OR "form_submissions"."started_at" <= "form_submissions"."submitted_at");