import { env } from "../env";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "./tokens";

export const ACCESS_TOKEN_COOKIE_NAME = "access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

export interface CookieResponseTarget {
  cookie: (name: string, value: string, options: Record<string, unknown>) => unknown;
  clearCookie: (name: string, options?: Record<string, unknown>) => unknown;
}

const isProduction = env.NODE_ENV === "production" || env.NODE_ENV === "prod";

/**
 * Returns cookie options for the short-lived access token
 */
export function getAccessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ACCESS_TOKEN_TTL * 1000,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

/**
 * Returns cookie options for the long-lived refresh token.
 * Path is scoped to /trpc so all auth/refresh/logout procedures receive it,
 * but non-API static/client navigation does not send it.
 */
export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/trpc",
    maxAge: REFRESH_TOKEN_TTL * 1000,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

/**
 * Centralized helper to set both access_token and refresh_token httpOnly cookies.
 */
export function setAuthCookies(
  res: CookieResponseTarget,
  tokens: { accessToken: string; refreshToken: string }
): void {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, getAccessTokenCookieOptions());
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, getRefreshTokenCookieOptions());
}

/**
 * Centralized helper to clear both authentication cookies across all configured paths.
 */
export function clearAuthCookies(res: CookieResponseTarget): void {
  const domainOption = env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {};

  // Clear access_token at root path
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
    path: "/",
    ...domainOption,
  });

  // Clear refresh_token at /trpc path
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    path: "/trpc",
    ...domainOption,
  });

  // Also clear refresh_token at / in case it was previously set there
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    path: "/",
    ...domainOption,
  });
}
