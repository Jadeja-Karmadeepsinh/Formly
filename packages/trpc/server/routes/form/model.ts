import { z } from "zod";
import {
  createFormInputSchema,
  formStatusEnum,
  formVisibilityEnum,
  updateFormInputSchema,
  saveFormDraftInputSchema,
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
  publishedVersionId: z.string().uuid().nullable().optional(),
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

// ==========================================
// Form Versioning Models
// ==========================================

export const formVersionOutputModel = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  versionNumber: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  themeId: z.string().nullable(),
  settings: z.record(z.string(), z.any()),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
});
export type FormVersionOutput = z.infer<typeof formVersionOutputModel>;

export const formVersionElementOutputModel = z.object({
  id: z.string().uuid(),
  formVersionId: z.string().uuid(),
  sourceElementId: z.string().uuid().nullable(),
  kind: z.enum(["question", "content"]),
  type: z.string(),
  label: z.string().nullable(),
  content: z.string().nullable(),
  helpText: z.string().nullable(),
  placeholder: z.string().nullable(),
  required: z.boolean(),
  sortOrder: z.number().int(),
  config: z.record(z.string(), z.any()),
  validationRules: z.record(z.string(), z.any()),
  createdAt: z.date(),
});
export type FormVersionElementOutput = z.infer<typeof formVersionElementOutputModel>;

export const saveFormDraftProcedureInputModel = saveFormDraftInputSchema;
export type SaveFormDraftProcedureInput = z.infer<typeof saveFormDraftProcedureInputModel>;

export const saveFormDraftOutputModel = z.object({
  form: formOutputModel,
  fields: z.array(formFieldOutputModel),
  version: formVersionOutputModel,
  isNoOp: z.boolean(),
});
export type SaveFormDraftOutput = z.infer<typeof saveFormDraftOutputModel>;

export const listFormVersionsProcedureInputModel = z.object({
  formId: z.string().uuid("Invalid form ID"),
});
export type ListFormVersionsProcedureInput = z.infer<typeof listFormVersionsProcedureInputModel>;

export const listFormVersionsOutputModel = z.array(formVersionOutputModel);
export type ListFormVersionsOutput = z.infer<typeof listFormVersionsOutputModel>;

export const getFormVersionProcedureInputModel = z.object({
  formId: z.string().uuid("Invalid form ID"),
  versionId: z.string().uuid("Invalid version ID").optional(),
  versionNumber: z.number().int().positive().optional(),
});
export type GetFormVersionProcedureInput = z.infer<typeof getFormVersionProcedureInputModel>;

export const getFormVersionOutputModel = z.object({
  version: formVersionOutputModel,
  elements: z.array(formVersionElementOutputModel),
});
export type GetFormVersionOutput = z.infer<typeof getFormVersionOutputModel>;

export const restoreFormVersionProcedureInputModel = z.object({
  formId: z.string().uuid("Invalid form ID"),
  versionId: z.string().uuid("Invalid version ID"),
  expectedVersion: z.number().int().positive().optional(),
});
export type RestoreFormVersionProcedureInput = z.infer<typeof restoreFormVersionProcedureInputModel>;

export const restoreFormVersionOutputModel = z.object({
  form: formOutputModel,
  fields: z.array(formFieldOutputModel),
  version: formVersionOutputModel,
});
export type RestoreFormVersionOutput = z.infer<typeof restoreFormVersionOutputModel>;
