import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { fromNodeHeaders } from "better-auth/node";
import { auth, type Session, type User } from "@formly/services/auth";

export interface TRPCContext {
  clientIp?: string;
  userAgent?: string;
  headers: Headers;
  session: Session["session"] | null;
  user: User | null;
}

export async function createContext({ req }: CreateExpressContextOptions): Promise<TRPCContext> {
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : req.ip || req.socket?.remoteAddress || undefined;

  const userAgent = (req.headers["user-agent"] as string) || undefined;
  const webHeaders = fromNodeHeaders(req.headers);

  let session: Session["session"] | null = null;
  let user: User | null = null;

  try {
    const sessionData = await auth.api.getSession({
      headers: webHeaders,
    });
    if (sessionData) {
      session = sessionData.session;
      user = sessionData.user;
    }
  } catch {
    session = null;
    user = null;
  }

  return {
    clientIp,
    userAgent,
    headers: webHeaders,
    session,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
