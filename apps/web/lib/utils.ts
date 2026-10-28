import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeRedirect(redirect: string | null | undefined): string {
  if (!redirect) return "/dashboard";
  // Must start with single / and not //, and not have backslashes, colons, or loop back to auth pages
  if (
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("\\") &&
    !redirect.includes(":") &&
    !redirect.startsWith("/login") &&
    !redirect.startsWith("/signup") &&
    !redirect.startsWith("/forgot-password") &&
    !redirect.startsWith("/reset-password")
  ) {
    return redirect;
  }
  return "/dashboard";
}

