import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { verifyAccessToken } from "@formly/services/user/tokens";
import { AUTH_ERROR_CODES, type AuthErrorCode } from "@formly/services/user/types";

import { createContext } from "./context";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({
    errorFormatter({ shape, error }) {
      const cause = error.cause as { appCode?: string } | undefined;
      const appCode =
        cause?.appCode ||
        (Object.values(AUTH_ERROR_CODES).includes(error.message as AuthErrorCode)
          ? (error.message as AuthErrorCode)
          : undefined);

      return {
        ...shape,
        data: {
          ...shape.data,
          appCode,
        },
      };
    },
  });

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
  const { ctx } = options;

  // Read access_token from httpOnly cookie (fallback to legacy ACCESS_TOKEN if present)
  const userToken = ctx.getCookie("access_token") || ctx.getCookie("ACCESS_TOKEN");

  if (!userToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
      cause: { appCode: AUTH_ERROR_CODES.NOT_AUTHENTICATED },
    });
  }

  const verification = verifyAccessToken(userToken);

  if (!verification.valid) {
    if (verification.error === "EXPIRED") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: AUTH_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
        cause: { appCode: AUTH_ERROR_CODES.ACCESS_TOKEN_EXPIRED },
      });
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AUTH_ERROR_CODES.INVALID_ACCESS_TOKEN,
      cause: { appCode: AUTH_ERROR_CODES.INVALID_ACCESS_TOKEN },
    });
  }

  return options.next({
    ctx: {
      user: { id: verification.userId },
    },
  });
});

export const protectedProcedure = authenticatedProcedure;
