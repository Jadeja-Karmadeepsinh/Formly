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

  // 2. Authenticated user trying to access login/signup/auth pages -> redirect to /dashboard
  if (isAuthRoute && sessionToken && !isResetWithParams) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
