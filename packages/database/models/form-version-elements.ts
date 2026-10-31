import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { formElementKindEnum, type FormElementType } from "./form-enums";
import type { FormElementConfig, FormValidationRules } from "./form-types";
import { formVersionsTable } from "./form-versions";

export const formVersionElementsTable = pgTable(
  "form_version_elements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formVersionId: uuid("form_version_id")
      .notNull()
      .references(() => formVersionsTable.id, { onDelete: "cascade" }),
    // Intentionally no FK: the editable source element may later be deleted.
    sourceElementId: uuid("source_element_id"),
    kind: formElementKindEnum("kind").notNull(),
    type: varchar("type", { length: 50 }).$type<FormElementType>().notNull(),
    label: varchar("label", { length: 500 }),
    content: text("content"),
    helpText: text("help_text"),
    placeholder: text("placeholder"),
    required: boolean("required").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    config: jsonb("config").$type<FormElementConfig>().notNull().default({}),
    validationRules: jsonb("validation_rules")
      .$type<FormValidationRules>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Required as the target of the composite FK from form_answers.
    unique("form_version_elements_id_version_unique").on(
      table.id,
      table.formVersionId,
    ),
    index("form_version_elements_version_sort_order_idx").on(
      table.formVersionId,
      table.sortOrder,
    ),
    index("form_version_elements_version_source_element_idx").on(
      table.formVersionId,
      table.sourceElementId,
    ),
    check(
      "form_version_elements_sort_order_non_negative_check",
      sql`${table.sortOrder} >= 0`,
    ),
    check(
      "form_version_elements_kind_content_check",
      sql`(${table.kind} = 'question' AND ${table.label} IS NOT NULL) OR (${table.kind} = 'content' AND ${table.required} = false AND ${table.type} IN ('heading', 'paragraph', 'divider') AND (${table.type} = 'divider' OR ${table.content} IS NOT NULL))`,
    ),
  ],
);
