import { pgTable, uuid, varchar, timestamp, text, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user";

export const accountsTable = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: varchar("provider_id", { length: 50 }).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_provider_account_idx").on(table.providerId, table.accountId),
  ]
);

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));

export type SelectAccount = typeof accountsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;
