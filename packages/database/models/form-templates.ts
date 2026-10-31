import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { formTemplateStatusEnum } from "./form-enums";
import type { FormTemplateDefinition } from "./form-types";
import { themesTable } from "./themes";
import { usersTable } from "./user";

export const formTemplatesTable = pgTable(
  "form_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // NULL means this is a Formly-provided template.
    createdBy: text("created_by").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    previewImageUrl: text("preview_image_url"),
    status: formTemplateStatusEnum("status").notNull().default("draft"),
    definition: jsonb("definition")
      .$type<FormTemplateDefinition>()
      .notNull(),
    themeId: uuid("theme_id").references(() => themesTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("form_templates_status_category_idx").on(
      table.status,
      table.category,
    ),
    index("form_templates_created_by_updated_at_idx").on(
      table.createdBy,
      table.updatedAt,
    ),
    index("form_templates_theme_id_idx").on(table.themeId),
    index("form_templates_deleted_at_idx").on(table.deletedAt),
  ],
);
