export const AUTH_ERROR_CODES = {
  ACCESS_TOKEN_EXPIRED: "ACCESS_TOKEN_EXPIRED",
  INVALID_ACCESS_TOKEN: "INVALID_ACCESS_TOKEN",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  REFRESH_TOKEN_MISSING: "REFRESH_TOKEN_MISSING",
  REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",
  REFRESH_TOKEN_EXPIRED: "REFRESH_TOKEN_EXPIRED",
  REFRESH_RACE: "REFRESH_RACE",
  REFRESH_TOKEN_REUSED: "REFRESH_TOKEN_REUSED",
  OAUTH_SESSION_MISSING: "OAUTH_SESSION_MISSING",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserSessionPayload {
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface AuthUserInfo {
  id: string;
  fullName: string;
  email: string;
}

export interface AuthResponseWithTokens {
  user: AuthUserInfo;
  tokens: AuthTokens;
}
