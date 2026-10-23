import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getCookie, setCookie, deleteCookie } from "./utils/cookie";

export interface TRPCCtxUser {
  id: string;
}

export interface TRPCCookieResponse {
  cookie: (name: string, value: string, options: Record<string, unknown>) => unknown;
  clearCookie: (name: string, options?: Record<string, unknown>) => unknown;
}

export interface TRPCContext {
  res: TRPCCookieResponse;
  setCookie: (name: string, value: string, options: Record<string, unknown>) => void;
  getCookie: (name: string) => string | undefined;
  deleteCookie: (name: string, options?: Record<string, unknown>) => void;
  clientIp?: string;
  userAgent?: string;
  headers: Record<string, string | string[] | undefined>;
  user?: TRPCCtxUser;
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<TRPCContext> {
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = typeof forwarded === "string"
    ? forwarded.split(",")[0]?.trim()
    : req.ip || req.socket?.remoteAddress || undefined;

  const userAgent = (req.headers["user-agent"] as string) || undefined;

  const ctx: TRPCContext = {
    res,
    setCookie: (name: string, value: string, options: Record<string, unknown>) =>
      setCookie(res, name, value, options),
    getCookie: (name: string) => getCookie(name, req),
    deleteCookie: (name: string, options?: Record<string, unknown>) =>
      deleteCookie(res, name, options),
    clientIp,
    userAgent,
    headers: req.headers,
    user: undefined,
  };

  return ctx;
}

export type Context = Awaited<ReturnType<typeof createContext>>;
