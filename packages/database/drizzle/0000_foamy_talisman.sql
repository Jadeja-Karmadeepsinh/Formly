CREATE TYPE "public"."form_element_kind" AS ENUM('question', 'content');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('draft', 'published', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."form_template_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."form_visibility" AS ENUM('public', 'unlisted');--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text,
	"name" varchar(120) NOT NULL,
	"description" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "form_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text,
	"title" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(100),
	"preview_image_url" text,
	"status" "form_template_status" DEFAULT 'draft' NOT NULL,
	"definition" jsonb NOT NULL,
	"theme_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"share_id" varchar(16) NOT NULL,
	"status" "form_status" DEFAULT 'draft' NOT NULL,
	"visibility" "form_visibility" DEFAULT 'unlisted' NOT NULL,
	"max_submissions" integer,
	"theme_id" uuid,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source_template_id" uuid,
	"published_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forms_share_id_unique" UNIQUE("share_id"),
	CONSTRAINT "forms_max_submissions_positive_check" CHECK ("forms"."max_submissions" IS NULL OR "forms"."max_submissions" > 0)
);
--> statement-breakpoint
CREATE TABLE "form_elements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"kind" "form_element_kind" NOT NULL,
	"type" varchar(50) NOT NULL,
	"label" varchar(500),
	"content" text,
	"help_text" text,
	"placeholder" text,
	"required" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"validation_rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_elements_sort_order_non_negative_check" CHECK ("form_elements"."sort_order" >= 0),
	CONSTRAINT "form_elements_kind_content_check" CHECK (("form_elements"."kind" = 'question' AND "form_elements"."label" IS NOT NULL) OR ("form_elements"."kind" = 'content' AND "form_elements"."required" = false AND "form_elements"."type" IN ('heading', 'paragraph', 'divider') AND ("form_elements"."type" = 'divider' OR "form_elements"."content" IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "form_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"theme_id" uuid,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_versions_form_id_version_number_unique" UNIQUE("form_id","version_number"),
	CONSTRAINT "form_versions_form_id_id_unique" UNIQUE("form_id","id"),
	CONSTRAINT "form_versions_version_number_positive_check" CHECK ("form_versions"."version_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "form_version_elements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_version_id" uuid NOT NULL,
	"source_element_id" uuid,
	"kind" "form_element_kind" NOT NULL,
	"type" varchar(50) NOT NULL,
	"label" varchar(500),
	"content" text,
	"help_text" text,
	"placeholder" text,
	"required" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"validation_rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_version_elements_id_version_unique" UNIQUE("id","form_version_id"),
	CONSTRAINT "form_version_elements_sort_order_non_negative_check" CHECK ("form_version_elements"."sort_order" >= 0),
	CONSTRAINT "form_version_elements_kind_content_check" CHECK (("form_version_elements"."kind" = 'question' AND "form_version_elements"."label" IS NOT NULL) OR ("form_version_elements"."kind" = 'content' AND "form_version_elements"."required" = false AND "form_version_elements"."type" IN ('heading', 'paragraph', 'divider') AND ("form_version_elements"."type" = 'divider' OR "form_version_elements"."content" IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"started_at" timestamp with time zone,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"country_code" varchar(2),
	"browser_name" varchar(100),
	"browser_version" varchar(50),
	"os_name" varchar(100),
	"os_version" varchar(50),
	"device_type" varchar(30),
	CONSTRAINT "form_submissions_id_version_unique" UNIQUE("id","form_version_id"),
	CONSTRAINT "form_submissions_started_before_submitted_check" CHECK ("form_submissions"."started_at" IS NULL OR "form_submissions"."started_at" <= "form_submissions"."submitted_at"),
	CONSTRAINT "form_submissions_device_type_check" CHECK ("form_submissions"."device_type" IS NULL OR "form_submissions"."device_type" IN ('desktop', 'mobile', 'tablet', 'unknown'))
);
--> statement-breakpoint
CREATE TABLE "form_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"form_version_element_id" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_answers_submission_element_unique" UNIQUE("submission_id","form_version_element_id")
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_source_template_id_form_templates_id_fk" FOREIGN KEY ("source_template_id") REFERENCES "public"."form_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_elements" ADD CONSTRAINT "form_elements_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_version_elements" ADD CONSTRAINT "form_version_elements_form_version_id_form_versions_id_fk" FOREIGN KEY ("form_version_id") REFERENCES "public"."form_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_version_fk" FOREIGN KEY ("form_id","form_version_id") REFERENCES "public"."form_versions"("form_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_submission_version_fk" FOREIGN KEY ("submission_id","form_version_id") REFERENCES "public"."form_submissions"("id","form_version_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_element_version_fk" FOREIGN KEY ("form_version_element_id","form_version_id") REFERENCES "public"."form_version_elements"("id","form_version_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "themes_created_by_updated_at_idx" ON "themes" USING btree ("created_by","updated_at");--> statement-breakpoint
CREATE INDEX "themes_deleted_at_idx" ON "themes" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_templates_status_category_idx" ON "form_templates" USING btree ("status","category");--> statement-breakpoint
CREATE INDEX "form_templates_created_by_updated_at_idx" ON "form_templates" USING btree ("created_by","updated_at");--> statement-breakpoint
CREATE INDEX "form_templates_theme_id_idx" ON "form_templates" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "form_templates_deleted_at_idx" ON "form_templates" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "forms_created_by_updated_at_idx" ON "forms" USING btree ("created_by","updated_at");--> statement-breakpoint
CREATE INDEX "forms_status_visibility_published_at_idx" ON "forms" USING btree ("status","visibility","published_at");--> statement-breakpoint
CREATE INDEX "forms_theme_id_idx" ON "forms" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "forms_source_template_id_idx" ON "forms" USING btree ("source_template_id");--> statement-breakpoint
CREATE INDEX "forms_deleted_at_idx" ON "forms" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_elements_form_id_sort_order_idx" ON "form_elements" USING btree ("form_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_elements_form_id_type_idx" ON "form_elements" USING btree ("form_id","type");--> statement-breakpoint
CREATE INDEX "form_versions_form_id_published_at_idx" ON "form_versions" USING btree ("form_id","published_at");--> statement-breakpoint
CREATE INDEX "form_version_elements_version_sort_order_idx" ON "form_version_elements" USING btree ("form_version_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_version_elements_version_source_element_idx" ON "form_version_elements" USING btree ("form_version_id","source_element_id");--> statement-breakpoint
CREATE INDEX "form_submissions_form_submitted_at_idx" ON "form_submissions" USING btree ("form_id","submitted_at");--> statement-breakpoint
CREATE INDEX "form_submissions_version_submitted_at_idx" ON "form_submissions" USING btree ("form_version_id","submitted_at");--> statement-breakpoint
CREATE INDEX "form_answers_form_version_element_id_idx" ON "form_answers" USING btree ("form_version_element_id");--> statement-breakpoint
CREATE INDEX "form_answers_version_element_idx" ON "form_answers" USING btree ("form_version_id","form_version_element_id");