import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@formly/database";
import {
  user,
  session,
  account,
  verification,
} from "@formly/database/schema";
import { logger } from "@formly/logger";
import { env } from "../env";
import { sendPasswordResetEmail, sendVerificationEmail } from "../email";

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
} else {
  logger.warn("Google OAuth credentials missing; Google sign-in is disabled");
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  };
} else {
  logger.warn("GitHub OAuth credentials missing; GitHub sign-in is disabled");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: Array.from(
    new Set([env.FRONTEND_URL, env.APP_URL, "http://localhost:3000"].filter(Boolean) as string[])
  ),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
    sendResetPassword: async ({ user, url }, _request) => {
      let resetUrl = url;
      try {
        const parsed = new URL(url);
        const cb = parsed.searchParams.get("callbackURL");
        if (!cb || cb === "/" || cb === "%2F") {
          parsed.searchParams.set("callbackURL", `${env.APP_URL}/reset-password`);
          resetUrl = parsed.toString();
        }
      } catch {
        resetUrl = url;
      }

      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        expiresInMinutes: 30,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, _request) => {
      let verificationUrl = url;
      try {
        const parsed = new URL(url);
        const cb = parsed.searchParams.get("callbackURL");
        if (!cb || cb === "/" || cb === "%2F") {
          parsed.searchParams.set("callbackURL", `${env.FRONTEND_URL}/dashboard`);
          verificationUrl = parsed.toString();
        }
      } catch {
        verificationUrl = url;
      }

      await sendVerificationEmail({
        to: user.email,
        verificationUrl,
      });
    },
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      disableImplicitLinking: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day renewal interval
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === "production" || env.NODE_ENV === "prod",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: env.NODE_ENV === "production" || env.NODE_ENV === "prod",
      path: "/",
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          const normalizedEmail = (userData.email || "").trim().toLowerCase();
          const rawName = (userData.name || normalizedEmail.split("@")[0] || "User").trim();
          return {
            data: {
              ...userData,
              email: normalizedEmail,
              name: rawName.slice(0, 80),
            },
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
