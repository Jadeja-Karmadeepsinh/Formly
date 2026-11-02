import { z } from "zod";

export const formVisibilityEnum = z.enum(["public", "unlisted"]);
export type FormVisibility = z.infer<typeof formVisibilityEnum>;

export const formStatusEnum = z.enum(["draft", "published", "closed", "archived"]);
export type FormStatus = z.infer<typeof formStatusEnum>;

export const defaultFormSettings: {
  submitButtonText: string;
  allowMultipleSubmissions: boolean;
  showProgressBar: boolean;
  redirectUrl: string | null;
  notifyOnSubmission: boolean;
  customSuccessMessage: string | null;
  [key: string]: unknown;
} = {
  submitButtonText: "Submit",
  allowMultipleSubmissions: true,
  showProgressBar: false,
  redirectUrl: null,
  notifyOnSubmission: false,
  customSuccessMessage: null,
};

export const formSettingsSchema = z
  .object({
    submitButtonText: z.string().default("Submit"),
    allowMultipleSubmissions: z.boolean().default(true),
    showProgressBar: z.boolean().default(false),
    redirectUrl: z.string().url().nullable().optional().default(null),
    notifyOnSubmission: z.boolean().default(false),
    customSuccessMessage: z.string().nullable().optional().default(null),
  })
  .passthrough();

export type FormSettingsInput = z.infer<typeof formSettingsSchema>;

export const updateFormSettingsSchema = z
  .object({
    submitButtonText: z.string().optional(),
    allowMultipleSubmissions: z.boolean().optional(),
    showProgressBar: z.boolean().optional(),
    redirectUrl: z.string().url().nullable().optional(),
    notifyOnSubmission: z.boolean().optional(),
    customSuccessMessage: z.string().nullable().optional(),
  })
  .passthrough();

export type UpdateFormSettingsInput = z.infer<typeof updateFormSettingsSchema>;

export const createFormInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .nullable()
    .optional(),
  visibility: formVisibilityEnum.default("unlisted"),
  maxSubmissions: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z
        .number()
        .int("Max submissions must be an integer")
        .positive("Max submissions must be greater than 0")
        .nullable()
    )
    .optional(),
  settings: formSettingsSchema.optional(),
  expiresAt: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : val),
      z.coerce.date().nullable()
    )
    .optional(),
});

export type CreateFormInput = z.infer<typeof createFormInputSchema>;

export const updateFormInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .nullable()
    .optional(),
  visibility: formVisibilityEnum.optional(),
  status: formStatusEnum.optional(),
  maxSubmissions: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z
        .number()
        .int("Max submissions must be an integer")
        .positive("Max submissions must be greater than 0")
        .nullable()
    )
    .optional(),
  settings: updateFormSettingsSchema.optional(),
  expiresAt: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : val),
      z.coerce.date().nullable()
    )
    .optional(),
});

export type UpdateFormInput = z.infer<typeof updateFormInputSchema>;
