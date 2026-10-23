import { createAuthClient } from "better-auth/client";
import { env } from "~/env.js";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut } = authClient;
