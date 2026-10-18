import { env } from "~/env.js";

const getBaseUrl = () => {
  return env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
};

// Module-level single-flight promise to coalesce concurrent refresh requests
let refreshPromise: Promise<"SUCCESS" | "RACE" | "FAILED"> | null = null;

const BYPASS_ENDPOINTS = [
  "auth.refresh",
  "auth.signInUserWithEmailAndPassword",
  "auth.createUserWithEmailAndPassword",
  "auth.logout",
];

const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

/**
 * Executes a single-flight silent refresh request to /trpc/auth.refresh
 */
export async function performSilentRefresh(): Promise<"SUCCESS" | "RACE" | "FAILED"> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const baseUrl = getBaseUrl();
  const refreshUrl = baseUrl.endsWith("/trpc")
    ? `${baseUrl}/auth.refresh`
    : `${baseUrl}/trpc/auth.refresh`;

  refreshPromise = (async () => {
    try {
      // Direct fetch with credentials: "include" - bypasses the interceptor to avoid recursion
      const res = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        credentials: "include",
      });

      if (res.ok) {
        return "SUCCESS";
      }

      // Check for REFRESH_RACE
      const data = await res.json().catch(() => null);
      const appCode = data?.error?.data?.appCode || data?.error?.message;

      if (appCode === "REFRESH_RACE") {
        // Benign race: Another concurrent tab/request just refreshed cookies; wait briefly
        await new Promise((resolve) => setTimeout(resolve, 350));
        return "RACE";
      }

      return "FAILED";
    } catch {
      return "FAILED";
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Handles redirecting to /login when authentication fails, preserving current URL
 */
function handleAuthFailureRedirect() {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  const isPublicPage = PUBLIC_AUTH_ROUTES.some((route) => currentPath.startsWith(route));

  if (!isPublicPage) {
    const search = window.location.search;
    const fullPath = currentPath + search;
    const redirectParam = encodeURIComponent(fullPath);
    window.location.href = `/login?redirect=${redirectParam}`;
  }
}

/**
 * Custom fetch implementation for tRPC that automatically intercepts 401
 * ACCESS_TOKEN_EXPIRED responses, triggers a single-flight silent refresh,
 * and retries the original request once.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const urlString = input.toString();

  // Add credentials: "include" to all requests
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
  };

  const response = await fetch(input, requestInit);

  // If status is not 401, return response as-is
  if (response.status !== 401) {
    return response;
  }

  // Prevent infinite loops on auth procedures
  const isBypass = BYPASS_ENDPOINTS.some((endpoint) => urlString.includes(endpoint));
  if (isBypass) {
    return response;
  }

  // Prevent retrying a request more than once
  const headers = new Headers(requestInit.headers);
  if (headers.get("x-auth-retried") === "1") {
    return response;
  }

  // Inspect response body to check for ACCESS_TOKEN_EXPIRED
  try {
    const clone = response.clone();
    const data = await clone.json();

    const isExpired = Array.isArray(data)
      ? data.some(
          (item) =>
            item?.error?.data?.appCode === "ACCESS_TOKEN_EXPIRED" ||
            item?.error?.message === "ACCESS_TOKEN_EXPIRED"
        )
      : data?.error?.data?.appCode === "ACCESS_TOKEN_EXPIRED" ||
        data?.error?.message === "ACCESS_TOKEN_EXPIRED";

    if (!isExpired) {
      // 401 but not an expired token (e.g. invalid/tampered token) - do not attempt refresh
      return response;
    }
  } catch {
    // If not JSON, return original response
    return response;
  }

  // Single-flight refresh attempt
  const refreshResult = await performSilentRefresh();

  if (refreshResult === "SUCCESS" || refreshResult === "RACE") {
    // Retry the original request exactly ONCE with updated cookies
    headers.set("x-auth-retried", "1");
    const retryInit: RequestInit = {
      ...requestInit,
      headers,
    };

    return fetch(input, retryInit);
  }

  // Refresh failed: Redirect to sign-in
  handleAuthFailureRedirect();

  return response;
}
