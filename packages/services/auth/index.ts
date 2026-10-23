import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, eq, and, isNull } from "@formly/database";
import {
  usersTable,
  accountsTable,
  authSessionsTable,
  verificationsTable,
  refreshTokensTable,
} from "@formly/database/schema";
import { logger } from "@formly/logger";
import { env } from "../env";

const socialProviders: Record<string, any> = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    mapProfileToUser: (profile: any) => {
      const email = (profile.email || "").trim().toLowerCase();
      const rawName = (profile.name || email.split("@")[0] || "User").trim();
      return {
        name: rawName.slice(0, 80),
        email,
        image: profile.picture || null,
      };
    },
    async getUserInfo(token: any) {
      if (!token.idToken) return null;
      let user: any;
      try {
        user = JSON.parse(Buffer.from(token.idToken.split(".")[1], "base64url").toString("utf8"));
      } catch (err) {
        logger.error("Failed to parse Google idToken payload", { err });
        return null;
      }
      if (!user?.email) return null;
      if (!user.email_verified) {
        logger.warn(`Google sign-in rejected for ${user.email}: email is not verified`);
        return null;
      }
      const email = (user.email as string).trim().toLowerCase();
      const rawName = (
        (user.name as string) ||
        (user.given_name as string) ||
        email.split("@")[0] ||
        "User"
      ).trim();
      return {
        user: {
          name: rawName.slice(0, 80),
          email,
          image: (user.picture as string) || null,
          emailVerified: true,
        },
        data: user,
      };
    },
  };
} else {
  logger.warn("Google OAuth credentials missing; Google sign-in is disabled");
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    scope: ["read:user", "user:email"],
    async getUserInfo(token: any) {
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          "User-Agent": "Formly-OAuth",
          Authorization: `Bearer ${token.accessToken}`,
        },
      });
      if (!userRes.ok) {
        logger.error(`GitHub user fetch failed: ${userRes.statusText}`);
        return null;
      }
      const profile = (await userRes.json()) as any;

      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          "User-Agent": "Formly-OAuth",
          Authorization: `Bearer ${token.accessToken}`,
        },
      });
      if (!emailsRes.ok) {
        logger.error(`GitHub emails fetch failed: ${emailsRes.statusText}`);
        return null;
      }
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;

      const primaryVerified =
        emails?.find((e) => e.primary && e.verified)?.email ||
        emails?.find((e) => e.verified)?.email;

      if (!primaryVerified) {
        logger.warn(`GitHub sign-in rejected for ${profile.login}: no verified email found`);
        return null;
      }

      const email = primaryVerified.trim().toLowerCase();
      const rawName = (profile.name || profile.login || email.split("@")[0] || "User").trim();

      return {
        user: {
          name: rawName.slice(0, 80),
          email,
          image: profile.avatar_url || null,
          emailVerified: true,
        },
        data: profile,
      };
    },
  };
} else {
  logger.warn("GitHub OAuth credentials missing; GitHub sign-in is disabled");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: usersTable,
      accounts: accountsTable,
      auth_sessions: authSessionsTable,
      verifications: verificationsTable,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: Array.from(new Set([env.FRONTEND_URL, env.APP_URL].filter(Boolean) as string[])),
  user: {
    modelName: "users",
    fields: {
      name: "fullName",
      image: "profileImageUrl",
    },
  },
  session: {
    modelName: "auth_sessions",
  },
  account: {
    modelName: "accounts",
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      requireLocalEmailVerified: false,
    },
  },
  verification: {
    modelName: "verifications",
  },
  socialProviders,
  advanced: {
    useSecureCookies: env.NODE_ENV === "production" || env.NODE_ENV === "prod",
    database: {
      generateId: "uuid",
    },
    generateId: () => crypto.randomUUID(),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const normalizedEmail = (user.email || "").trim().toLowerCase();
          const rawName = (user.name || normalizedEmail.split("@")[0] || "User").trim();
          return {
            data: {
              ...user,
              email: normalizedEmail,
              name: rawName.slice(0, 80),
              emailVerified: true,
            },
          };
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          // Pre-hijack mitigation (Section 3 item 6):
          // If an OAuth account links to an existing user whose emailVerified is false and has a password:
          // (a) set emailVerified = true, (b) null out password/salt, (c) revoke all refresh tokens.
          try {
            const userRows = await db
              .select()
              .from(usersTable)
              .where(eq(usersTable.id, account.userId));
            const existingUser = userRows[0];
            if (existingUser && existingUser.password && !existingUser.emailVerified) {
              logger.info(
                `Mitigating pre-hijack risk for user ${existingUser.id}: setting emailVerified=true, nulling password, revoking refresh tokens`
              );
              await db.transaction(async (tx) => {
                await tx
                  .update(usersTable)
                  .set({
                    emailVerified: true,
                    password: null,
                    salt: null,
                  })
                  .where(eq(usersTable.id, existingUser.id));

                await tx
                  .update(refreshTokensTable)
                  .set({ revokedAt: new Date() })
                  .where(
                    and(
                      eq(refreshTokensTable.userId, existingUser.id),
                      isNull(refreshTokensTable.revokedAt)
                    )
                  );
              });
            }
          } catch (err) {
            logger.error("Failed to execute pre-hijack mitigation in account.create.after", { err });
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
