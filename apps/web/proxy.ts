import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

//TODO: Currently only i have dashboard page thats why only it is in protected routes 
const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. Unauthenticated user trying to access a protected route -> redirect to /login
  if (isProtectedRoute && !accessToken) {
    const redirectUrl = new URL("/login", request.url);
    const fullPath = pathname + search;
    if (fullPath !== "/dashboard") {
      redirectUrl.searchParams.set("redirect", fullPath);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Authenticated user trying to access login/signup/auth pages -> redirect to /dashboard
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};

export default proxy;

