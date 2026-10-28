import { createAuthClient } from "better-auth/react";
import { env } from "~/env.js";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  fetchOptions: {
    credentials: "include",
  },
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  linkSocial,
  unlinkAccount,
  listAccounts,
  revokeSession,
  revokeSessions,
  revokeOtherSessions,
} = authClient;

// Backward-compatible alias
export const forgetPassword = requestPasswordReset;
