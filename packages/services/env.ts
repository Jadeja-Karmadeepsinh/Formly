import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "prod", "production", "test"]).default("development"),
    JWT_SECRET: z.string().optional().describe("Legacy JWT Secret"),
    JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters").optional(),
    ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
    COOKIE_DOMAIN: z.string().optional(),
    APP_URL: z.string().default("http://localhost:3000"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().default("Formly <no-reply@formly.com>"),
  })
  .transform((data) => {
    const accessSecret = data.JWT_ACCESS_SECRET || data.JWT_SECRET;
    if (!accessSecret) {
      throw new Error("Either JWT_ACCESS_SECRET (min 32 chars) or JWT_SECRET must be defined");
    }
    return {
      ...data,
      JWT_ACCESS_SECRET: accessSecret,
      JWT_SECRET: accessSecret,
    };
  });

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
