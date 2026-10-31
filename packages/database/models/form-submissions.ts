import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { DeviceType } from "./form-types";
import { formVersionsTable } from "./form-versions";

export const formSubmissionsTable = pgTable(
  "form_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id").notNull(),
    formVersionId: uuid("form_version_id").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    countryCode: varchar("country_code", { length: 2 }),
    browserName: varchar("browser_name", { length: 100 }),
    browserVersion: varchar("browser_version", { length: 50 }),
    osName: varchar("os_name", { length: 100 }),
    osVersion: varchar("os_version", { length: 50 }),
    deviceType: varchar("device_type", { length: 30 }).$type<DeviceType>(),
  },
  (table) => [
    // Ensures the selected version actually belongs to this form.
    foreignKey({
      name: "form_submissions_form_version_fk",
      columns: [table.formId, table.formVersionId],
      foreignColumns: [formVersionsTable.formId, formVersionsTable.id],
    }).onDelete("restrict"),
    // Required as the target of the composite FK from form_answers.
    unique("form_submissions_id_version_unique").on(
      table.id,
      table.formVersionId,
    ),
    index("form_submissions_form_submitted_at_idx").on(
      table.formId,
      table.submittedAt,
    ),
    index("form_submissions_version_submitted_at_idx").on(
      table.formVersionId,
      table.submittedAt,
    ),
    check(
      "form_submissions_started_before_submitted_check",
      sql`${table.startedAt} IS NULL OR ${table.startedAt} <= ${table.submittedAt}`,
    ),
    check(
      "form_submissions_device_type_check",
      sql`${table.deviceType} IS NULL OR ${table.deviceType} IN ('desktop', 'mobile', 'tablet', 'unknown')`,
    ),
  ],
);
