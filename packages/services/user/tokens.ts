import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../env";

export const ACCESS_TOKEN_TTL_MINUTES = env.ACCESS_TOKEN_TTL_MINUTES || 15;
export const ACCESS_TOKEN_TTL = ACCESS_TOKEN_TTL_MINUTES * 60; // in seconds

export const REFRESH_TOKEN_TTL_DAYS = env.REFRESH_TOKEN_TTL_DAYS || 7;
export const REFRESH_TOKEN_TTL = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60; // in seconds

export const REUSE_GRACE_SECONDS = 10;
export const MAX_SESSION_DAYS = 30;

export interface AccessTokenPayload {
  sub: string;
  id: string;
  iat?: number;
  exp?: number;
}

export type VerifyAccessTokenResult =
  | { valid: true; userId: string; payload: AccessTokenPayload }
  | { valid: false; error: "EXPIRED" | "INVALID" };

/**
 * Signs a short-lived JWT access token
 */
export function signAccessToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      id: userId,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: `${ACCESS_TOKEN_TTL_MINUTES}m`,
      algorithm: "HS256",
    }
  );
}

/**
 * Verifies and decodes a JWT access token, strictly distinguishing between
 * expired tokens and invalid/tampered tokens.
 */
export function verifyAccessToken(token: string): VerifyAccessTokenResult {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    }) as AccessTokenPayload;

    const userId = payload.sub || payload.id;
    if (!userId) {
      return { valid: false, error: "INVALID" };
    }

    return { valid: true, userId, payload };
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "EXPIRED" };
    }
    return { valid: false, error: "INVALID" };
  }
}

/**
 * Hashes an opaque token using SHA-256 hex string.
 */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Generates a cryptographically strong, opaque 48-byte base64url refresh token
 * along with its SHA-256 storage hash.
 */
export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = randomBytes(48).toString("base64url");
  const hash = hashToken(raw);
  return { raw, hash };
}
