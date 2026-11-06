import { z } from "zod";

// ==========================================
// Base Types
// ==========================================

export const deviceTypeEnum = z.enum(["desktop", "mobile", "tablet", "unknown"]);
export type DeviceType = z.infer<typeof deviceTypeEnum>;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

// ==========================================
// Metadata & Context Schemas
// ==========================================

export const submissionMetadataSchema = z.object({
  countryCode: z
    .string()
    .length(2, "Country code must be 2 characters")
    .toUpperCase()
    .nullable()
    .optional(),
  browserName: z.string().max(100).nullable().optional(),
  browserVersion: z.string().max(50).nullable().optional(),
  osName: z.string().max(100).nullable().optional(),
  osVersion: z.string().max(50).nullable().optional(),
  deviceType: deviceTypeEnum.nullable().optional(),
});
export type SubmissionMetadata = z.infer<typeof submissionMetadataSchema>;

// ==========================================
// Answer Schemas
// ==========================================

export const answerItemInputSchema = z.object({
  /**
   * Identifies the question being answered. The backend resolves this against
   * the immutable form_version_elements table.
   */
  formVersionElementId: z.string().uuid("Invalid element ID"),
  /**
   * The value payload. The service strictly validates its shape against the
   * question's type, configured options, and validation rules.
   */
  value: z.any(),
});
export type AnswerItemInput = z.infer<typeof answerItemInputSchema>;

// ==========================================
// Procedure & Service Inputs
// ==========================================

export const startSubmissionInputSchema = z.object({
  /**
   * Public shareId of the form.
   */
  shareId: z.string().min(1, "Share ID is required"),
  /**
   * Unguessable client-generated attempt token (UUID) for idempotency,
   * page-refresh recovery, and React duplicate-mount prevention.
   */
  clientAttemptId: z.string().uuid("Invalid client attempt ID").optional(),
});
export type StartSubmissionInput = z.infer<typeof startSubmissionInputSchema>;

export const completeSubmissionInputSchema = z.object({
  submissionId: z.string().uuid("Invalid submission ID"),
  answers: z.array(answerItemInputSchema),
});
export type CompleteSubmissionInput = z.infer<typeof completeSubmissionInputSchema>;

export const getSubmissionByIdInputSchema = z.object({
  submissionId: z.string().uuid("Invalid submission ID"),
});
export type GetSubmissionByIdInput = z.infer<typeof getSubmissionByIdInputSchema>;

export const listSubmissionsByFormIdInputSchema = z.object({
  formId: z.string().uuid("Invalid form ID"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  includeInProgress: z.boolean().default(false),
});
export type ListSubmissionsByFormIdInput = z.infer<typeof listSubmissionsByFormIdInputSchema>;

export const getSubmissionStatsByFormIdInputSchema = z.object({
  formId: z.string().uuid("Invalid form ID"),
});
export type GetSubmissionStatsByFormIdInput = z.infer<typeof getSubmissionStatsByFormIdInputSchema>;

// ==========================================
// Response Models
// ==========================================

export const startSubmissionResultSchema = z.object({
  submissionId: z.string().uuid(),
  formId: z.string().uuid(),
  formVersionId: z.string().uuid(),
  startedAt: z.date(),
  isExistingAttempt: z.boolean(),
});
export type StartSubmissionResult = z.infer<typeof startSubmissionResultSchema>;

export const completeSubmissionResultSchema = z.object({
  success: z.boolean(),
  submissionId: z.string().uuid(),
  submittedAt: z.date(),
  completionDurationMs: z.number().nullable(),
  alreadyCompleted: z.boolean(),
});
export type CompleteSubmissionResult = z.infer<typeof completeSubmissionResultSchema>;

export const submissionAnswerDetailSchema = z.object({
  id: z.string().uuid(),
  formVersionElementId: z.string().uuid(),
  questionLabel: z.string().nullable(),
  questionType: z.string(),
  sortOrder: z.number(),
  value: z.any(),
  createdAt: z.date(),
});
export type SubmissionAnswerDetail = z.infer<typeof submissionAnswerDetailSchema>;

export const submissionDetailSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  formVersionId: z.string().uuid(),
  startedAt: z.date(),
  submittedAt: z.date().nullable(),
  completionDurationMs: z.number().nullable(),
  countryCode: z.string().nullable(),
  browserName: z.string().nullable(),
  browserVersion: z.string().nullable(),
  osName: z.string().nullable(),
  osVersion: z.string().nullable(),
  deviceType: deviceTypeEnum.nullable(),
  answers: z.array(submissionAnswerDetailSchema),
});
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>;

export const submissionListItemSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  formVersionId: z.string().uuid(),
  startedAt: z.date(),
  submittedAt: z.date().nullable(),
  completionDurationMs: z.number().nullable(),
  countryCode: z.string().nullable(),
  browserName: z.string().nullable(),
  browserVersion: z.string().nullable(),
  osName: z.string().nullable(),
  osVersion: z.string().nullable(),
  deviceType: deviceTypeEnum.nullable(),
  answersCount: z.number(),
});
export type SubmissionListItem = z.infer<typeof submissionListItemSchema>;

export const listSubmissionsResultSchema = z.object({
  items: z.array(submissionListItemSchema),
  totalCount: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});
export type ListSubmissionsResult = z.infer<typeof listSubmissionsResultSchema>;

export const breakdownItemSchema = z.object({
  key: z.string(),
  count: z.number(),
});
export type BreakdownItem = z.infer<typeof breakdownItemSchema>;

export const submissionStatsResultSchema = z.object({
  totalStarted: z.number(),
  totalCompleted: z.number(),
  totalInProgress: z.number(),
  completionRate: z.number(),
  averageDurationSeconds: z.number().nullable(),
  deviceBreakdown: z.array(breakdownItemSchema),
  browserBreakdown: z.array(breakdownItemSchema),
  osBreakdown: z.array(breakdownItemSchema),
  countryBreakdown: z.array(breakdownItemSchema),
});
export type SubmissionStatsResult = z.infer<typeof submissionStatsResultSchema>;

// ==========================================
// Workspace / All Submissions Listing
// ==========================================

export const allSubmissionsListItemSchema = submissionListItemSchema.extend({
  formTitle: z.string(),
  formStatus: z.string(),
  formVisibility: z.string(),
});
export type AllSubmissionsListItem = z.infer<typeof allSubmissionsListItemSchema>;

export const listAllSubmissionsInputSchema = z.object({
  formId: z.string().uuid("Invalid form ID").optional(),
  status: z.enum(["all", "completed", "in_progress"]).default("all"),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListAllSubmissionsInput = z.infer<typeof listAllSubmissionsInputSchema>;

export const listAllSubmissionsResultSchema = z.object({
  items: z.array(allSubmissionsListItemSchema),
  totalCount: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});
export type ListAllSubmissionsResult = z.infer<typeof listAllSubmissionsResultSchema>;

// ==========================================
// Analytics Models
// ==========================================

export const getAnalyticsInputSchema = z.object({
  formId: z.string().uuid("Invalid form ID").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type GetAnalyticsInput = z.infer<typeof getAnalyticsInputSchema>;

export const timeSeriesPointSchema = z.object({
  date: z.string(),
  started: z.number(),
  completed: z.number(),
});
export type TimeSeriesPoint = z.infer<typeof timeSeriesPointSchema>;

export const formPerformanceItemSchema = z.object({
  formId: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  visibility: z.string(),
  shareId: z.string().nullable(),
  totalStarted: z.number(),
  totalCompleted: z.number(),
  completionRate: z.number(),
  avgDurationSeconds: z.number().nullable(),
  lastSubmissionAt: z.date().nullable(),
});
export type FormPerformanceItem = z.infer<typeof formPerformanceItemSchema>;

export const analyticsResultSchema = z.object({
  overview: submissionStatsResultSchema,
  timeSeries: z.array(timeSeriesPointSchema),
  formsPerformance: z.array(formPerformanceItemSchema),
});
export type AnalyticsResult = z.infer<typeof analyticsResultSchema>;

// ==========================================
// Question-Level Analytics Models
// ==========================================

export const getQuestionInsightsInputSchema = z.object({
  formId: z.string().uuid("Invalid form ID"),
});
export type GetQuestionInsightsInput = z.infer<typeof getQuestionInsightsInputSchema>;

export const questionOptionDistributionSchema = z.object({
  optionLabel: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type QuestionOptionDistribution = z.infer<typeof questionOptionDistributionSchema>;

export const questionInsightItemSchema = z.object({
  elementId: z.string().uuid(),
  label: z.string(),
  type: z.string(),
  sortOrder: z.number(),
  required: z.boolean(),
  totalAnswers: z.number(),
  distribution: z.array(questionOptionDistributionSchema),
  averageScore: z.number().nullable(),
  recentAnswers: z.array(
    z.object({
      id: z.string().uuid(),
      value: z.any(),
      submittedAt: z.date(),
    })
  ),
});
export type QuestionInsightItem = z.infer<typeof questionInsightItemSchema>;

export const questionInsightsResultSchema = z.object({
  formId: z.string().uuid(),
  formTitle: z.string(),
  totalSubmissions: z.number(),
  questions: z.array(questionInsightItemSchema),
});
export type QuestionInsightsResult = z.infer<typeof questionInsightsResultSchema>;

// ==========================================
// Submissions Export Models
// ==========================================

export const exportSubmissionsInputSchema = z.object({
  formId: z.string().uuid("Invalid form ID").optional(),
  status: z.enum(["all", "completed", "in_progress"]).default("completed"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type ExportSubmissionsInput = z.infer<typeof exportSubmissionsInputSchema>;

export const exportSubmissionRowSchema = z.object({
  submissionId: z.string().uuid(),
  formTitle: z.string(),
  startedAt: z.date(),
  submittedAt: z.date().nullable(),
  durationSeconds: z.number().nullable(),
  deviceType: z.string().nullable(),
  browser: z.string().nullable(),
  os: z.string().nullable(),
  country: z.string().nullable(),
  answers: z.record(z.string(), z.any()),
});
export type ExportSubmissionRow = z.infer<typeof exportSubmissionRowSchema>;

export const exportSubmissionsResultSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(exportSubmissionRowSchema),
  filename: z.string(),
});
export type ExportSubmissionsResult = z.infer<typeof exportSubmissionsResultSchema>;
