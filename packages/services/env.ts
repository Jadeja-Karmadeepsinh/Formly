import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "prod", "production", "test"]).default("development"),
  JWT_SECRET: z.string().describe("JWT Secret"),
  APP_URL: z.string().default("http://localhost:3000"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default("Formly <no-reply@formly.com>"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
