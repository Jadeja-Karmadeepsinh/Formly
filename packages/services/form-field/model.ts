import { z } from "zod";
import {
  FORM_ELEMENT_TYPES,
  type FormElementType,
} from "@formly/database/models/form-enums";

export const formElementKindEnum = z.enum(["question", "content"]);
export type FormElementKind = z.infer<typeof formElementKindEnum>;

export const formElementTypeEnum = z.enum(
  FORM_ELEMENT_TYPES as unknown as [FormElementType, ...FormElementType[]]
);

export const formElementOptionSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Option label is required"),
  value: z.string().trim().min(1, "Option value is required"),
});
export type FormElementOption = z.infer<typeof formElementOptionSchema>;

export const formElementConfigSchema = z
  .object({
    options: z.array(formElementOptionSchema).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    minLabel: z.string().optional(),
    maxLabel: z.string().optional(),
    rows: z.number().optional(),
  })
  .passthrough();
export type FormElementConfigInput = z.infer<typeof formElementConfigSchema>;

export const formValidationRulesSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    customErrorMessage: z.string().optional(),
  })
  .passthrough();
export type FormValidationRulesInput = z.infer<typeof formValidationRulesSchema>;

export const createFormFieldInputSchema = z.object({
  kind: formElementKindEnum.default("question"),
  type: formElementTypeEnum,
  label: z.string().trim().max(500).nullable().optional(),
  content: z.string().trim().nullable().optional(),
  helpText: z.string().trim().max(2000).nullable().optional(),
  placeholder: z.string().trim().max(255).nullable().optional(),
  required: z.boolean().default(false),
  sortOrder: z.number().int().min(0).optional(),
  config: formElementConfigSchema.optional().default({}),
  validationRules: formValidationRulesSchema.optional().default({}),
});

export type CreateFormFieldInput = z.infer<typeof createFormFieldInputSchema>;

export const updateFormFieldInputSchema = z.object({
  type: formElementTypeEnum.optional(),
  label: z.string().trim().max(500).nullable().optional(),
  content: z.string().trim().nullable().optional(),
  helpText: z.string().trim().max(2000).nullable().optional(),
  placeholder: z.string().trim().max(255).nullable().optional(),
  required: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  config: formElementConfigSchema.optional(),
  validationRules: formValidationRulesSchema.optional(),
});

export type UpdateFormFieldInput = z.infer<typeof updateFormFieldInputSchema>;

export const reorderFormFieldsInputSchema = z.object({
  fieldIds: z
    .array(z.string().uuid("Invalid field ID"))
    .min(1, "At least one field ID is required"),
});

export type ReorderFormFieldsInput = z.infer<typeof reorderFormFieldsInputSchema>;

export const syncFieldItemSchema = z.object({
  id: z.string().optional(),
  kind: formElementKindEnum.default("question"),
  type: formElementTypeEnum,
  label: z.string().trim().max(500).nullable().optional(),
  content: z.string().trim().nullable().optional(),
  helpText: z.string().trim().max(2000).nullable().optional(),
  placeholder: z.string().trim().max(255).nullable().optional(),
  required: z.boolean().default(false),
  sortOrder: z.number().int().min(0).optional(),
  config: formElementConfigSchema.optional().default({}),
  validationRules: formValidationRulesSchema.optional().default({}),
});

export const syncFormFieldsInputSchema = z.object({
  fields: z.array(syncFieldItemSchema),
});

export type SyncFormFieldsInput = z.infer<typeof syncFormFieldsInputSchema>;
