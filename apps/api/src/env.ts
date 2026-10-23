import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional().describe("Port"),
  NODE_ENV: z.enum(["development", "prod"]).default("development").describe("Node Environment"),
  BASE_URL: z.string().default("http://localhost:8000").describe("Base URL"),

  BETTER_AUTH_SECRET: z.string().optional().describe("Better Auth Secret"),
  BETTER_AUTH_URL: z.string().optional().describe("Better Auth URL"),

  GOOGLE_CLIENT_ID: z.string().optional().describe("Google Client ID"),
  GOOGLE_CLIENT_SECRET: z.string().optional().describe("Google Client Secret"),

  GITHUB_CLIENT_ID: z.string().optional().describe("GitHub Client ID"),
  GITHUB_CLIENT_SECRET: z.string().optional().describe("GitHub Client Secret"),

  FRONTEND_URL: z.string().default("http://localhost:3000").describe("Frontend URL"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
