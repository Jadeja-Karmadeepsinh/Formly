import {
  foreignKey,
  index,
  jsonb,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import type { JsonValue } from "./form-types";
import { formSubmissionsTable } from "./form-submissions";
import { formVersionElementsTable } from "./form-version-elements";
import { formVersionsTable } from "./form-versions";

export const formAnswersTable = pgTable(
  "form_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id").notNull(),
    // Intentionally duplicated to enforce that the answer and question
    // belong to the same published version as the submission.
    formVersionId: uuid("form_version_id").notNull(),
    formVersionElementId: uuid("form_version_element_id").notNull(),
    value: jsonb("value").$type<JsonValue>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "form_answers_submission_version_fk",
      columns: [table.submissionId, table.formVersionId],
      foreignColumns: [formSubmissionsTable.id, formSubmissionsTable.formVersionId],
    }).onDelete("cascade"),
    foreignKey({
      name: "form_answers_element_version_fk",
      columns: [table.formVersionElementId, table.formVersionId],
      foreignColumns: [formVersionElementsTable.id, formVersionElementsTable.formVersionId],
    }).onDelete("restrict"),
    unique("form_answers_submission_element_unique").on(
      table.submissionId,
      table.formVersionElementId,
    ),
    index("form_answers_form_version_element_id_idx").on(
      table.formVersionElementId,
    ),
    index("form_answers_version_element_idx").on(
      table.formVersionId,
      table.formVersionElementId,
    ),
  ],
);
