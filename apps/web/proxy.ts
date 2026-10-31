import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Better Auth session cookie (handles both dev http and prod https prefixes)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. Unauthenticated user trying to access a protected route -> redirect to /login
  if (isProtectedRoute && !sessionToken) {
    const redirectUrl = new URL("/login", request.url);
    const fullPath = pathname + search;
    if (fullPath !== "/dashboard") {
      redirectUrl.searchParams.set("redirect", fullPath);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Allow reset-password with a token or error query even if a session exists
  const isResetWithParams =
    pathname === "/reset-password" &&
    (request.nextUrl.searchParams.has("token") || request.nextUrl.searchParams.has("error"));

  // 2. User accessing login/signup/auth pages
  if (isAuthRoute) {
    // If arriving with ?redirect= or ?error=, it means a protected route rejected their session
    // (e.g. database was reset, session expired or was revoked). Clear any stale cookies and stay on auth page!
    if (request.nextUrl.searchParams.has("redirect") || request.nextUrl.searchParams.has("error")) {
      const response = NextResponse.next();
      if (sessionToken) {
        response.cookies.delete("better-auth.session_token");
        response.cookies.delete("__Secure-better-auth.session_token");
      }
      return response;
    }

    // Authenticated user with session attempting to access auth page -> redirect to /dashboard
    if (sessionToken && !isResetWithParams) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};

export default proxy;
