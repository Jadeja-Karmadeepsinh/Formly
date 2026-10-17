import { TRPCError } from "@trpc/server";
import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

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
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

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
    .mutation(async ({ input }) => {
      try {
        const { fullName: inputFullName, email: inputEmail, password: inputPassword } = input;
        const res = await userService.createUserWithEmailAndPassword({
          fullName: inputFullName,
          email: inputEmail,
          password: inputPassword,
        });
        return res;
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
    .mutation(async ({ input }) => {
      try {
        const { email: inputEmail, password: inputPassword } = input;
        const res = await userService.signInUserWithEmailAndPassword({
          email: inputEmail,
          password: inputPassword,
        });
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Sign-in failed";
        throw new TRPCError({ code: "UNAUTHORIZED", message });
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
});
