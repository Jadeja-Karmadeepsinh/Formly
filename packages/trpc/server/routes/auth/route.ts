import { TRPCError } from "@trpc/server";
import { authService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { zodUndefinedModel } from "../../schema";
import { meOutputModel } from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
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
      const user = await authService.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      return {
        id: user.id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        image: user.image ?? null,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      };
    }),
});
