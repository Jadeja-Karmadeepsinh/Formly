import { z } from "zod";
import {
  createFormFieldInputSchema,
  formElementKindEnum,
  formElementTypeEnum,
  reorderFormFieldsInputSchema,
  syncFormFieldsInputSchema,
  updateFormFieldInputSchema,
} from "@formly/services/form-field/model";

export const formFieldParentInputModel = z.object({
  formId: z.string().uuid("Invalid form ID"),
});
export type FormFieldParentInput = z.infer<typeof formFieldParentInputModel>;

export const formFieldIdInputModel = z.object({
  formId: z.string().uuid("Invalid form ID"),
  id: z.string().uuid("Invalid field ID"),
});
export type FormFieldIdInput = z.infer<typeof formFieldIdInputModel>;

export const createFormFieldProcedureInputModel = z
  .object({
    formId: z.string().uuid("Invalid form ID"),
  })
  .merge(createFormFieldInputSchema);
export type CreateFormFieldProcedureInput = z.infer<
  typeof createFormFieldProcedureInputModel
>;

export const updateFormFieldProcedureInputModel = z
  .object({
    formId: z.string().uuid("Invalid form ID"),
    id: z.string().uuid("Invalid field ID"),
  })
  .merge(updateFormFieldInputSchema);
export type UpdateFormFieldProcedureInput = z.infer<
  typeof updateFormFieldProcedureInputModel
>;

export const reorderFormFieldsProcedureInputModel = z
  .object({
    formId: z.string().uuid("Invalid form ID"),
  })
  .merge(reorderFormFieldsInputSchema);
export type ReorderFormFieldsProcedureInput = z.infer<
  typeof reorderFormFieldsProcedureInputModel
>;

export const syncFormFieldsProcedureInputModel = z
  .object({
    formId: z.string().uuid("Invalid form ID"),
  })
  .merge(syncFormFieldsInputSchema);
export type SyncFormFieldsProcedureInput = z.infer<
  typeof syncFormFieldsProcedureInputModel
>;

export const formFieldOutputModel = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  kind: formElementKindEnum,
  type: formElementTypeEnum,
  label: z.string().nullable(),
  content: z.string().nullable(),
  helpText: z.string().nullable(),
  placeholder: z.string().nullable(),
  required: z.boolean(),
  sortOrder: z.number(),
  config: z.record(z.string(), z.any()),
  validationRules: z.record(z.string(), z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type FormFieldOutput = z.infer<typeof formFieldOutputModel>;

export const listFormFieldsOutputModel = z.array(formFieldOutputModel);
export type ListFormFieldsOutput = z.infer<typeof listFormFieldsOutputModel>;

export const deleteFormFieldOutputModel = z.object({
  success: z.boolean(),
  id: z.string().uuid(),
});
export type DeleteFormFieldOutput = z.infer<typeof deleteFormFieldOutputModel>;

