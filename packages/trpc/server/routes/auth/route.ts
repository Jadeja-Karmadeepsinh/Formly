import { zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signInUserWithEmailAndPasswordInputModel,
  signInUserWithEmailAndPasswordOutputModel
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS
      }
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input }) => {
      const { fullName: inputFullName, email: inputEmail, password: inputPassword } = input;

      const { id, fullName, email, token } = await userService.createUserWithEmailAndPassword({ fullName: inputFullName, email: inputEmail, password: inputPassword });

      return {
        id,
        fullName,
        email,
        token
      };
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInUserWithEmailAndPassword"),
        tags: TAGS
      }
    })
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input }) => {
      const { email: inputEmail, password: inputPassword } = input;

      const { id, fullName, email, token } = await userService.signInUserWithEmailAndPassword({ email: inputEmail, password: inputPassword });

      return {
        id,
        fullName,
        email,
        token
      };
    }),
});
