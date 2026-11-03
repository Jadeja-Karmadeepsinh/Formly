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
  saveFormDraftProcedureInputModel,
  saveFormDraftOutputModel,
  listFormVersionsProcedureInputModel,
  listFormVersionsOutputModel,
  getFormVersionProcedureInputModel,
  getFormVersionOutputModel,
  restoreFormVersionProcedureInputModel,
  restoreFormVersionOutputModel,
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

  // ==========================================
  // Form Versioning & Draft Save Procedures
  // ==========================================

  saveFormDraft: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/saveFormDraft"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(saveFormDraftProcedureInputModel)
    .output(saveFormDraftOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await formService.saveFormDraft(ctx.user.id, input);
        return result as any;
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("CONCURRENCY_CONFLICT")) {
            throw new TRPCError({
              code: "CONFLICT",
              message: error.message,
            });
          }
          if (error.message.includes("not found")) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: error.message,
            });
          }
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save form draft",
        });
      }
    }),

  listFormVersions: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listFormVersions/{formId}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(listFormVersionsProcedureInputModel)
    .output(listFormVersionsOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        const versions = await formService.listFormVersions(
          ctx.user.id,
          input.formId
        );
        return versions as any;
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes("not found")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list form versions",
        });
      }
    }),

  getFormVersionById: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormVersionById"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getFormVersionProcedureInputModel)
    .output(getFormVersionOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        const detail = await formService.getFormVersionById(
          ctx.user.id,
          input.formId,
          input.versionId,
          input.versionNumber
        );
        if (!detail) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Form version not found",
          });
        }
        return detail as any;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Error && error.message.includes("not found")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get form version",
        });
      }
    }),

  restoreFormVersion: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/restoreFormVersion"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(restoreFormVersionProcedureInputModel)
    .output(restoreFormVersionOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await formService.restoreFormVersion(ctx.user.id, input);
        return result as any;
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("CONCURRENCY_CONFLICT")) {
            throw new TRPCError({
              code: "CONFLICT",
              message: error.message,
            });
          }
          if (error.message.includes("not found")) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: error.message,
            });
          }
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to restore form version",
        });
      }
    }),
});
