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
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { formElementKindEnum, type FormElementType } from "./form-enums";
import type { FormElementConfig, FormValidationRules } from "./form-types";
import { formsTable } from "./forms";

export const formElementsTable = pgTable(
  "form_elements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
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
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("form_elements_form_id_sort_order_idx").on(
      table.formId,
      table.sortOrder,
    ),
    index("form_elements_form_id_type_idx").on(table.formId, table.type),
    check(
      "form_elements_sort_order_non_negative_check",
      sql`${table.sortOrder} >= 0`,
    ),
    check(
      "form_elements_kind_content_check",
      sql`(${table.kind} = 'question' AND ${table.label} IS NOT NULL) OR (${table.kind} = 'content' AND ${table.required} = false AND ${table.type} IN ('heading', 'paragraph', 'divider') AND (${table.type} = 'divider' OR ${table.content} IS NOT NULL))`,
    ),
  ],
);
