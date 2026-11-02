import { TRPCError } from "@trpc/server";
import { formFieldService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFormFieldProcedureInputModel,
  deleteFormFieldOutputModel,
  formFieldIdInputModel,
  formFieldOutputModel,
  formFieldParentInputModel,
  listFormFieldsOutputModel,
  reorderFormFieldsProcedureInputModel,
  updateFormFieldProcedureInputModel,
} from "./model";

const TAGS = ["Form Fields"];
const getPath = generatePath("/form-fields");

export const formFieldsRouter = router({
  createFormField: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createFormField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFormFieldProcedureInputModel)
    .output(formFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const { formId, ...data } = input;
        return (await formFieldService.createFormField(
          ctx.user.id,
          formId,
          data
        )) as any;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create form field",
        });
      }
    }),

  listFormFields: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listFormFields/{formId}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(formFieldParentInputModel)
    .output(listFormFieldsOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        return (await formFieldService.listFormFields(
          ctx.user.id,
          input.formId
        )) as any;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list form fields",
        });
      }
    }),

  getFormFieldById: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormFieldById/{formId}/{id}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(formFieldIdInputModel)
    .output(formFieldOutputModel)
    .query(async ({ ctx, input }) => {
      const field = await formFieldService.getFormFieldById(
        ctx.user.id,
        input.formId,
        input.id
      );
      if (!field) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form field not found",
        });
      }
      return field as any;
    }),

  updateFormField: authenticatedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateFormField/{formId}/{id}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFormFieldProcedureInputModel)
    .output(formFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      const { formId, id, ...data } = input;
      const updated = await formFieldService.updateFormField(
        ctx.user.id,
        formId,
        id,
        data
      );
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form field not found or could not be updated",
        });
      }
      return updated as any;
    }),

  deleteFormField: authenticatedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteFormField/{formId}/{id}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(formFieldIdInputModel)
    .output(deleteFormFieldOutputModel)
    .mutation(async ({ ctx, input }) => {
      const deleted = await formFieldService.deleteFormField(
        ctx.user.id,
        input.formId,
        input.id
      );
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form field not found or already deleted",
        });
      }
      return { success: true, id: input.id };
    }),

  reorderFormFields: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/reorderFormFields"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(reorderFormFieldsProcedureInputModel)
    .output(listFormFieldsOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const { formId, ...data } = input;
        return (await formFieldService.reorderFormFields(
          ctx.user.id,
          formId,
          data
        )) as any;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reorder form fields",
        });
      }
    }),
});

