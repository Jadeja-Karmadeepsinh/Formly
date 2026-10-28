import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "prod", "production", "test"])
      .default("development")
      .describe("Node Environment"),
    COOKIE_DOMAIN: z.string().optional().describe("Cookie Domain"),
    APP_URL: z.string().default("http://localhost:3000").describe("App URL"),
    SMTP_HOST: z.string().optional().describe("SMTP Host"),
    SMTP_PORT: z.string().optional().describe("SMTP Port"),
    SMTP_USER: z.string().optional().describe("SMTP User"),
    SMTP_PASS: z.string().optional().describe("SMTP Pass"),
    EMAIL_FROM: z.string().default("Formly <no-reply@formly.com>").describe("Email From"),

    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET must be at least 32 characters")
      .optional()
      .describe("Better Auth Secret"),
    BETTER_AUTH_URL: z.string().default("http://localhost:8000").describe("Better Auth URL"),

    GOOGLE_CLIENT_ID: z.string().optional().describe("Google Client ID"),
    GOOGLE_CLIENT_SECRET: z.string().optional().describe("Google Client Secret"),

    GITHUB_CLIENT_ID: z.string().optional().describe("GitHub Client ID"),
    GITHUB_CLIENT_SECRET: z.string().optional().describe("GitHub Client Secret"),

    FRONTEND_URL: z.string().default("http://localhost:3000").describe("Frontend URL"),
  })
  .transform((data) => {
    const isProd = data.NODE_ENV === "production" || data.NODE_ENV === "prod";
    if (isProd) {
      if (!data.BETTER_AUTH_SECRET) {
        throw new Error("BETTER_AUTH_SECRET (min 32 chars) is required in production");
      }
      if (!data.GOOGLE_CLIENT_ID || !data.GOOGLE_CLIENT_SECRET) {
        throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in production");
      }
      if (!data.GITHUB_CLIENT_ID || !data.GITHUB_CLIENT_SECRET) {
        throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required in production");
      }
    }

    return data;
  });

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
