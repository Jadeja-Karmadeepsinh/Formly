import type { Response, CookieOptions, Request } from "express";

export function setCookie(res: Response, name: string, value: string, options: CookieOptions) {
  res.cookie(name, value, options);
}

export function getCookie(name: string, req: Request): string | undefined {
  return req.cookies?.[name];
}

export function deleteCookie(res: Response, name: string, options?: CookieOptions) {
  if (options) {
    res.clearCookie(name, options);
  } else {
    res.clearCookie(name);
  }
}