import { pgEnum } from "drizzle-orm/pg-core";

export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "published",
  "closed",
  "archived",
]);

export const formVisibilityEnum = pgEnum("form_visibility", [
  "public",
  "unlisted",
]);

export const formElementKindEnum = pgEnum("form_element_kind", [
  "question",
  "content",
]);

export const formTemplateStatusEnum = pgEnum("form_template_status", [
  "draft",
  "published",
  "archived",
]);

/**
 * Keep this list in sync with the shared Zod schemas used by the API.
 * Element types are VARCHAR columns rather than PostgreSQL enums so new
 * element types do not require a database enum migration.
 */
export const FORM_ELEMENT_TYPES = [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "dropdown",
  "checkbox",
  "phone",
  "website_url",
  "date",
  "time",
  "linear_rating",
  "star_rating",
  "ranking",
  "heading",
  "paragraph",
  "divider",
] as const;

export type FormElementType = (typeof FORM_ELEMENT_TYPES)[number];
