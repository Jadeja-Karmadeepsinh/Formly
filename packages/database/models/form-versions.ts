import { sql } from "drizzle-orm";
import {
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

import type { FormSettings } from "./form-types";
import { formsTable } from "./forms";
import { themesTable } from "./themes";

export const formVersionsTable = pgTable(
  "form_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    // Snapshot of the theme selection at the time of publication.
    themeId: uuid("theme_id").references(() => themesTable.id, {
      onDelete: "set null",
    }),
    settings: jsonb("settings").$type<FormSettings>().notNull().default({}),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("form_versions_form_id_version_number_unique").on(
      table.formId,
      table.versionNumber,
    ),
    // Required as the target of composite foreign keys from submissions.
    unique("form_versions_form_id_id_unique").on(
      table.formId,
      table.id,
    ),
    index("form_versions_form_id_published_at_idx").on(
      table.formId,
      table.publishedAt,
    ),
    check(
      "form_versions_version_number_positive_check",
      sql`${table.versionNumber} > 0`,
    ),
  ],
);
