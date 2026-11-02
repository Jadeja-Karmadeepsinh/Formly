import { z } from "zod";
import {
  createFormInputSchema,
  formStatusEnum,
  formVisibilityEnum,
  updateFormInputSchema,
} from "@formly/services/form/model";
import { formFieldOutputModel } from "../form-field/model";

export const formIdInputModel = z.object({
  id: z.string().uuid("Invalid form ID"),
});
export type FormIdInput = z.infer<typeof formIdInputModel>;

export const createFormProcedureInputModel = createFormInputSchema;
export type CreateFormProcedureInput = z.infer<typeof createFormProcedureInputModel>;

export const updateFormProcedureInputModel = z
  .object({
    id: z.string().uuid("Invalid form ID"),
  })
  .merge(updateFormInputSchema);
export type UpdateFormProcedureInput = z.infer<typeof updateFormProcedureInputModel>;

export const formOutputModel = z.object({
  id: z.string().uuid(),
  createdBy: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  shareId: z.string(),
  status: formStatusEnum,
  visibility: formVisibilityEnum,
  maxSubmissions: z.number().nullable(),
  themeId: z.string().nullable(),
  settings: z.record(z.string(), z.any()),
  sourceTemplateId: z.string().nullable(),
  publishedAt: z.date().nullable(),
  closedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type FormOutput = z.infer<typeof formOutputModel>;

export const listFormsOutputModel = z.array(formOutputModel);
export type ListFormsOutput = z.infer<typeof listFormsOutputModel>;

export const deleteFormOutputModel = z.object({
  success: z.boolean(),
  id: z.string().uuid(),
});
export type DeleteFormOutput = z.infer<typeof deleteFormOutputModel>;

export const formShareIdInputModel = z.object({
  shareId: z.string().min(1, "Share ID is required"),
});
export type FormShareIdInput = z.infer<typeof formShareIdInputModel>;

export const publicFormDetailOutputModel = z.object({
  form: formOutputModel,
  fields: z.array(formFieldOutputModel),
});
export type PublicFormDetailOutput = z.infer<typeof publicFormDetailOutputModel>;

