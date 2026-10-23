import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeRedirect(redirect: string | null | undefined): string {
  if (!redirect) return "/dashboard";
  // Must start with single / and not //, and not have backslashes or protocol schemes
  if (
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("\\") &&
    !redirect.includes(":")
  ) {
    return redirect;
  }
  return "/dashboard";
}

