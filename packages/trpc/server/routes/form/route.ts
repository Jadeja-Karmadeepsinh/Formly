import { TRPCError } from "@trpc/server";
import { formService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { zodUndefinedModel } from "../../schema";
import {
  createFormProcedureInputModel,
  deleteFormOutputModel,
  formIdInputModel,
  formOutputModel,
  formShareIdInputModel,
  listFormsOutputModel,
  publicFormDetailOutputModel,
  updateFormProcedureInputModel,
} from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFormProcedureInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.createForm(ctx.user.id, input);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create form",
        });
      }
    }),

  listFormsByUserId: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listFormsByUserId"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(zodUndefinedModel)
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      return await formService.listForms(ctx.user.id);
    }),

  getFormById: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormById/{id}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(formIdInputModel)
    .output(formOutputModel)
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(ctx.user.id, input.id);
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }
      return form;
    }),

  updateFormById: authenticatedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateFormById/{id}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFormProcedureInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updated = await formService.updateForm(ctx.user.id, id, data);
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or could not be updated",
        });
      }
      return updated;
    }),

  deleteFormById: authenticatedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteFormById/{id}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(formIdInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      const deleted = await formService.deleteForm(ctx.user.id, input.id);
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or already deleted",
        });
      }
      return { success: true, id: input.id };
    }),

  publishForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/publishForm/{id}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(formIdInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      const updated = await formService.publishForm(ctx.user.id, input.id);
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or could not be published",
        });
      }
      return updated;
    }),

  unpublishForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/unpublishForm/{id}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(formIdInputModel)
    .output(formOutputModel)
    .mutation(async ({ ctx, input }) => {
      const updated = await formService.unpublishForm(ctx.user.id, input.id);
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or could not be unpublished",
        });
      }
      return updated;
    }),

  getPublicFormByShareId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getPublicFormByShareId/{shareId}"),
        tags: TAGS,
      },
    })
    .input(formShareIdInputModel)
    .output(publicFormDetailOutputModel)
    .query(async ({ input }) => {
      const result = await formService.getFormByShareId(input.shareId);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }
      return result as any;
    }),
});

