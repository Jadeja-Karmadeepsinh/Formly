import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user";
import type { JsonObject } from "./form-types";

export const themesTable = pgTable(
  "themes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // NULL means this is a built-in Formly theme.
    createdBy: text("created_by").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    config: jsonb("config").$type<JsonObject>().notNull().default({}),
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
    index("themes_created_by_updated_at_idx").on(
      table.createdBy,
      table.updatedAt,
    ),
    index("themes_deleted_at_idx").on(table.deletedAt),
  ],
);
