import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  emailVerified: boolean("email_verified").default(false).notNull(),

  password: text("password"),
  salt: text("salt"),

  profileImageUrl: text("profile_image_url"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

import { relations } from "drizzle-orm";
import { refreshTokensTable } from "./refresh-token";
import { passwordResetTokensTable } from "./password-reset-token";
import { accountsTable } from "./account";
import { authSessionsTable } from "./auth-session";

export const usersRelations = relations(usersTable, ({ many }) => ({
  refreshTokens: many(refreshTokensTable),
  passwordResetTokens: many(passwordResetTokensTable),
  accounts: many(accountsTable),
  authSessions: many(authSessionsTable),
}));

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
