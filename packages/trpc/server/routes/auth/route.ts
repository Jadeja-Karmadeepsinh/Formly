import { TRPCError } from "@trpc/server";
import { setAuthCookies, clearAuthCookies, REFRESH_TOKEN_COOKIE_NAME } from "@formly/services/user/cookies";
import { AUTH_ERROR_CODES } from "@formly/services/user/types";
import { AuthServiceError } from "@formly/services/user";
import { userService } from "../../services";
import { publicProcedure, authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { zodUndefinedModel, z } from "../../schema";

import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signInUserWithEmailAndPasswordInputModel,
  signInUserWithEmailAndPasswordOutputModel,
  requestPasswordResetInputModel,
  requestPasswordResetOutputModel,
  verifyResetTokenInputModel,
  verifyResetTokenOutputModel,
  resetPasswordInputModel,
  resetPasswordOutputModel,
  refreshOutputModel,
  logoutOutputModel,
  logoutAllOutputModel,
  meOutputModel,
  completeOAuthSignInInputModel,
  completeOAuthSignInOutputModel,
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

const emptyMutationInput = z.object({}).optional().default({});

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const { fullName: inputFullName, email: inputEmail, password: inputPassword } = input;
        const res = await userService.createUserWithEmailAndPassword(
          {
            fullName: inputFullName,
            email: inputEmail,
            password: inputPassword,
          },
          { userAgent: ctx.userAgent, ipAddress: ctx.clientIp }
        );

        // Set httpOnly access_token and refresh_token cookies
        setAuthCookies(ctx.res, res.tokens);

        return {
          id: res.id,
          fullName: res.fullName,
          email: res.email,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Registration failed";
        throw new TRPCError({ code: "BAD_REQUEST", message });
      }
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const { email: inputEmail, password: inputPassword } = input;
        const res = await userService.signInUserWithEmailAndPassword(
          {
            email: inputEmail,
            password: inputPassword,
          },
          { userAgent: ctx.userAgent, ipAddress: ctx.clientIp }
        );

        // Set httpOnly access_token and refresh_token cookies
        setAuthCookies(ctx.res, res.tokens);

        return {
          id: res.id,
          fullName: res.fullName,
          email: res.email,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Sign-in failed";
        throw new TRPCError({ code: "UNAUTHORIZED", message });
      }
    }),

  refresh: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/refresh"),
        tags: TAGS,
      },
    })
    .input(emptyMutationInput)
    .output(refreshOutputModel)
    .mutation(async ({ ctx }) => {
      const refreshToken = ctx.getCookie(REFRESH_TOKEN_COOKIE_NAME);

      if (!refreshToken) {
        clearAuthCookies(ctx.res);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING,
          cause: { appCode: AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING },
        });
      }

      try {
        const tokens = await userService.refreshSession({
          refreshToken,
          userAgent: ctx.userAgent,
          ipAddress: ctx.clientIp,
        });

        setAuthCookies(ctx.res, tokens);
        return { success: true };
      } catch (err: unknown) {
        if (err instanceof AuthServiceError) {
          if (err.code === AUTH_ERROR_CODES.REFRESH_RACE) {
            // Benign race: Do NOT clear cookies; the other concurrent request set new cookies
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: AUTH_ERROR_CODES.REFRESH_RACE,
              cause: { appCode: AUTH_ERROR_CODES.REFRESH_RACE },
            });
          }

          // Revocation / theft / expired / invalid -> Clear cookies
          clearAuthCookies(ctx.res);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: err.code,
            cause: { appCode: err.code },
          });
        }

        clearAuthCookies(ctx.res);
        const message = err instanceof Error ? err.message : "Refresh failed";
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message,
          cause: { appCode: AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID },
        });
      }
    }),

  logout: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/logout"),
        tags: TAGS,
      },
    })
    .input(emptyMutationInput)
    .output(logoutOutputModel)
    .mutation(async ({ ctx }) => {
      const refreshToken = ctx.getCookie(REFRESH_TOKEN_COOKIE_NAME);
      await userService.logoutSession(refreshToken);
      clearAuthCookies(ctx.res);
      return { success: true };
    }),

  logoutAll: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/logoutAll"),
        tags: TAGS,
      },
    })
    .input(emptyMutationInput)
    .output(logoutAllOutputModel)
    .mutation(async ({ ctx }) => {
      await userService.revokeAllUserRefreshTokens(ctx.user.id);
      clearAuthCookies(ctx.res);
      return { success: true };
    }),

  me: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/me"),
        tags: TAGS,
      },
    })
    .input(zodUndefinedModel)
    .output(meOutputModel)
    .query(async ({ ctx }) => {
      try {
        const user = await userService.getUserInfoById(ctx.user.id);
        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        };
      } catch (err: unknown) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
          cause: { appCode: AUTH_ERROR_CODES.NOT_AUTHENTICATED },
        });
      }
    }),

  requestPasswordReset: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/requestPasswordReset"),
        tags: TAGS,
      },
    })
    .input(requestPasswordResetInputModel)
    .output(requestPasswordResetOutputModel)
    .mutation(async ({ input }) => {
      const res = await userService.requestPasswordReset({ email: input.email });
      return res;
    }),

  verifyResetToken: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/verifyResetToken"),
        tags: TAGS,
      },
    })
    .input(verifyResetTokenInputModel)
    .output(verifyResetTokenOutputModel)
    .query(async ({ input }) => {
      const res = await userService.verifyResetToken({ token: input.token });
      return res;
    }),

  resetPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/resetPassword"),
        tags: TAGS,
      },
    })
    .input(resetPasswordInputModel)
    .output(resetPasswordOutputModel)
    .mutation(async ({ input }) => {
      try {
        const res = await userService.resetPassword({
          token: input.token,
          newPassword: input.newPassword,
          confirmPassword: input.confirmPassword,
        });
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Reset password failed";
        throw new TRPCError({ code: "BAD_REQUEST", message });
      }
    }),

  completeOAuthSignIn: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/completeOAuthSignIn"),
        tags: TAGS,
      },
    })
    .input(completeOAuthSignInInputModel)
    .output(completeOAuthSignInOutputModel)
    .mutation(async ({ ctx }) => {
      try {
        const res = await userService.completeOAuthSignIn({
          headers: ctx.headers,
          metadata: { userAgent: ctx.userAgent, ipAddress: ctx.clientIp },
        });

        // Set httpOnly access_token and refresh_token cookies
        setAuthCookies(ctx.res, res.tokens);

        // Clear temporary Better Auth cookies via context helpers
        const clearOpts = { path: "/", httpOnly: true, sameSite: "lax" as const };
        ctx.deleteCookie("better-auth.session_token", clearOpts);
        ctx.deleteCookie("__Secure-better-auth.session_token", clearOpts);
        ctx.deleteCookie("better-auth.session_data", clearOpts);
        ctx.deleteCookie("__Secure-better-auth.session_data", clearOpts);

        return {
          id: res.id,
          fullName: res.fullName,
          email: res.email,
        };
      } catch (err: unknown) {
        if (err instanceof AuthServiceError) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: err.message || err.code,
            cause: { appCode: err.code },
          });
        }
        const message = err instanceof Error ? err.message : "OAuth sign-in failed";
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message,
          cause: { appCode: AUTH_ERROR_CODES.OAUTH_SESSION_MISSING },
        });
      }
    }),
});
