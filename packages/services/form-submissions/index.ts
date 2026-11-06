import { and, asc, count, desc, eq, gte, inArray, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { db } from "@formly/database";
import {
  formsTable,
  formVersionsTable,
  formVersionElementsTable,
  formSubmissionsTable,
  formAnswersTable,
  type FormSubmission,
  type FormAnswer,
  type FormElementType,
} from "@formly/database/schema";
import type { FormElementConfig, FormValidationRules, JsonValue } from "@formly/database/models/form-types";

import {
  startSubmissionInputSchema,
  completeSubmissionInputSchema,
  getSubmissionByIdInputSchema,
  listSubmissionsByFormIdInputSchema,
  getSubmissionStatsByFormIdInputSchema,
  listAllSubmissionsInputSchema,
  getAnalyticsInputSchema,
  getQuestionInsightsInputSchema,
  exportSubmissionsInputSchema,
  type StartSubmissionInput,
  type CompleteSubmissionInput,
  type GetSubmissionByIdInput,
  type ListSubmissionsByFormIdInput,
  type GetSubmissionStatsByFormIdInput,
  type ListAllSubmissionsInput,
  type ListAllSubmissionsResult,
  type GetAnalyticsInput,
  type AnalyticsResult,
  type GetQuestionInsightsInput,
  type QuestionInsightsResult,
  type ExportSubmissionsInput,
  type ExportSubmissionsResult,
  type SubmissionMetadata,
  type StartSubmissionResult,
  type CompleteSubmissionResult,
  type SubmissionDetail,
  type ListSubmissionsResult,
  type SubmissionStatsResult,
} from "./model";

export class FormSubmissionService {
  /**
   * Helper: validates and coerces an individual answer value against its question element's
   * type, configured options, and validation rules.
   */
  private validateAnswerValue(
    element: {
      id: string;
      type: FormElementType;
      label: string | null;
      config: FormElementConfig;
      validationRules: FormValidationRules;
    },
    rawValue: unknown
  ): JsonValue {
    if (rawValue === undefined || rawValue === null) {
      throw new Error(`Value for question "${element.label || element.id}" cannot be null or undefined.`);
    }

    const config = (element.config || {}) as Record<string, any>;
    const rules = (element.validationRules || {}) as Record<string, any>;

    switch (element.type) {
      case "short_text": {
        if (typeof rawValue !== "string") {
          throw new Error(`Invalid answer for "${element.label || element.id}": expected text.`);
        }
        const trimmed = rawValue.trim();
        if (trimmed.length > 500) {
          throw new Error(`Answer for "${element.label || element.id}" exceeds 500 characters.`);
        }
        if (rules.min && trimmed.length < Number(rules.min)) {
          throw new Error(rules.customErrorMessage || `Answer for "${element.label || element.id}" must be at least ${rules.min} characters.`);
        }
        if (rules.max && trimmed.length > Number(rules.max)) {
          throw new Error(rules.customErrorMessage || `Answer for "${element.label || element.id}" cannot exceed ${rules.max} characters.`);
        }
        if (rules.pattern) {
          try {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(trimmed)) {
              throw new Error(rules.customErrorMessage || `Answer for "${element.label || element.id}" is improperly formatted.`);
            }
          } catch (e: any) {
            if (e.message?.includes("improperly formatted")) throw e;
          }
        }
        return trimmed;
      }

      case "long_text": {
        if (typeof rawValue !== "string") {
          throw new Error(`Invalid answer for "${element.label || element.id}": expected text.`);
        }
        const trimmed = rawValue.trim();
        if (trimmed.length > 10000) {
          throw new Error(`Answer for "${element.label || element.id}" exceeds 10,000 characters.`);
        }
        if (rules.min && trimmed.length < Number(rules.min)) {
          throw new Error(rules.customErrorMessage || `Answer for "${element.label || element.id}" must be at least ${rules.min} characters.`);
        }
        if (rules.max && trimmed.length > Number(rules.max)) {
          throw new Error(rules.customErrorMessage || `Answer for "${element.label || element.id}" cannot exceed ${rules.max} characters.`);
        }
        return trimmed;
      }

      case "email": {
        if (typeof rawValue !== "string") {
          throw new Error(`Invalid answer for "${element.label || element.id}": expected valid email.`);
        }
        const trimmed = rawValue.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
          throw new Error(`Answer for "${element.label || element.id}" must be a valid email address.`);
        }
        return trimmed;
      }

      case "number": {
        const num = typeof rawValue === "number" ? rawValue : Number(rawValue);
        if (isNaN(num)) {
          throw new Error(`Invalid answer for "${element.label || element.id}": expected a number.`);
        }
        if (rules.min !== undefined && num < Number(rules.min)) {
          throw new Error(rules.customErrorMessage || `Answer for "${element.label || element.id}" must be at least ${rules.min}.`);
        }
        if (rules.max !== undefined && num > Number(rules.max)) {
          throw new Error(rules.customErrorMessage || `Answer for "${element.label || element.id}" cannot exceed ${rules.max}.`);
        }
        return num;
      }

      case "single_select":
      case "dropdown": {
        if (typeof rawValue !== "string") {
          throw new Error(`Invalid answer for "${element.label || element.id}": expected option value.`);
        }
        const selectedVal = rawValue.trim();
        const options = Array.isArray(config.options) ? config.options : [];
        const validOption = options.some(
          (opt: any) => opt.value === selectedVal || opt.id === selectedVal || opt.label === selectedVal
        );
        if (options.length > 0 && !validOption) {
          throw new Error(`Selected option for "${element.label || element.id}" is not a valid choice.`);
        }
        return selectedVal;
      }

      case "multi_select": {
        if (!Array.isArray(rawValue)) {
          throw new Error(`Invalid answer for "${element.label || element.id}": expected an array of choices.`);
        }
        const stringChoices = rawValue.map((c) => String(c).trim());
        const uniqueChoices = Array.from(new Set(stringChoices));
        if (uniqueChoices.length !== stringChoices.length) {
          throw new Error(`Duplicate choices submitted for "${element.label || element.id}".`);
        }
        const options = Array.isArray(config.options) ? config.options : [];
        if (options.length > 0) {
          for (const choice of uniqueChoices) {
            const matches = options.some(
              (opt: any) => opt.value === choice || opt.id === choice || opt.label === choice
            );
            if (!matches) {
              throw new Error(`Option "${choice}" is not a valid choice for "${element.label || element.id}".`);
            }
          }
        }
        return uniqueChoices;
      }

      case "checkbox": {
        if (typeof rawValue !== "boolean") {
          if (rawValue === "true" || rawValue === 1) return true;
          if (rawValue === "false" || rawValue === 0) return false;
          throw new Error(`Invalid answer for "${element.label || element.id}": expected boolean.`);
        }
        return rawValue;
      }

      case "phone": {
        if (typeof rawValue !== "string") {
          throw new Error(`Invalid phone number for "${element.label || element.id}".`);
        }
        const trimmed = rawValue.trim();
        if (trimmed.length > 30) {
          throw new Error(`Phone number for "${element.label || element.id}" is too long.`);
        }
        return trimmed;
      }

      case "website_url": {
        if (typeof rawValue !== "string") {
          throw new Error(`Invalid URL for "${element.label || element.id}".`);
        }
        const trimmed = rawValue.trim();
        try {
          new URL(trimmed);
        } catch {
          throw new Error(`Answer for "${element.label || element.id}" must be a valid URL (including https://).`);
        }
        return trimmed;
      }

      case "date": {
        if (typeof rawValue !== "string") {
          throw new Error(`Invalid date for "${element.label || element.id}".`);
        }
        const trimmed = rawValue.trim();
        const parsedDate = new Date(trimmed);
        if (isNaN(parsedDate.getTime())) {
          throw new Error(`Answer for "${element.label || element.id}" must be a valid date.`);
        }
        return trimmed;
      }

      case "time": {
        if (typeof rawValue !== "string") {
          throw new Error(`Invalid time for "${element.label || element.id}".`);
        }
        const trimmed = rawValue.trim();
        return trimmed;
      }

      case "star_rating":
      case "linear_rating": {
        const rating = typeof rawValue === "number" ? rawValue : Number(rawValue);
        if (isNaN(rating) || !Number.isInteger(rating)) {
          throw new Error(`Answer for "${element.label || element.id}" must be an integer rating.`);
        }
        const minBound = config.min !== undefined ? Number(config.min) : 1;
        const maxBound = config.max !== undefined ? Number(config.max) : (element.type === "star_rating" ? 5 : 10);
        if (rating < minBound || rating > maxBound) {
          throw new Error(`Rating for "${element.label || element.id}" must be between ${minBound} and ${maxBound}.`);
        }
        return rating;
      }

      case "ranking": {
        if (!Array.isArray(rawValue)) {
          throw new Error(`Invalid answer for "${element.label || element.id}": expected ranked list.`);
        }
        const rankedItems = rawValue.map((item) => String(item).trim());
        const uniqueItems = Array.from(new Set(rankedItems));
        if (uniqueItems.length !== rankedItems.length) {
          throw new Error(`Duplicate items found in ranking for "${element.label || element.id}".`);
        }
        const options = Array.isArray(config.options) ? config.options : [];
        if (options.length > 0) {
          for (const item of uniqueItems) {
            const matches = options.some(
              (opt: any) => opt.value === item || opt.id === item || opt.label === item
            );
            if (!matches) {
              throw new Error(`Item "${item}" is not valid in ranking for "${element.label || element.id}".`);
            }
          }
        }
        return uniqueItems;
      }

      default: {
        // Fallback for custom or future types: must be valid JSON serializable
        try {
          JSON.stringify(rawValue);
          return rawValue as JsonValue;
        } catch {
          throw new Error(`Invalid value for question "${element.label || element.id}".`);
        }
      }
    }
  }

  /**
   * Stage 1: Starts a submission attempt for a public form.
   * Records server-generated startedAt, captures trusted metadata, verifies publication state,
   * checks submission limits, and returns the attempt identifier.
   */
  public async startSubmission(
    rawInput: StartSubmissionInput,
    metadata?: SubmissionMetadata
  ): Promise<StartSubmissionResult> {
    const input = startSubmissionInputSchema.parse(rawInput);

    // 1. Resolve the public form by shareId
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.shareId, input.shareId), isNull(formsTable.deletedAt)))
      .limit(1);

    if (!form) {
      throw new Error("Form not found or link is invalid");
    }

    if (form.status !== "published" || !form.publishedVersionId) {
      throw new Error("This form is not currently accepting public submissions");
    }

    if (form.closedAt && new Date() >= form.closedAt) {
      throw new Error("This form is closed and no longer accepting responses");
    }

    if (form.expiresAt && new Date() >= form.expiresAt) {
      throw new Error("This form has expired");
    }

    // 2. Check submission limits
    if (form.maxSubmissions !== null) {
      const [completedCountResult] = await db
        .select({ count: count() })
        .from(formSubmissionsTable)
        .where(
          and(
            eq(formSubmissionsTable.formId, form.id),
            isNotNull(formSubmissionsTable.submittedAt)
          )
        );

      if (Number(completedCountResult?.count || 0) >= form.maxSubmissions) {
        throw new Error("This form has reached its maximum submission limit");
      }
    }

    // 3. Idempotency / Retry Handling
    if (input.clientAttemptId) {
      const [existing] = await db
        .select()
        .from(formSubmissionsTable)
        .where(eq(formSubmissionsTable.id, input.clientAttemptId))
        .limit(1);

      if (existing) {
        if (existing.formId !== form.id) {
          throw new Error("Client attempt ID belongs to an unrelated form");
        }
        return {
          submissionId: existing.id,
          formId: existing.formId,
          formVersionId: existing.formVersionId,
          startedAt: existing.startedAt,
          isExistingAttempt: true,
        };
      }
    }

    // 4. Create new submission record
    const [created] = await db
      .insert(formSubmissionsTable)
      .values({
        id: input.clientAttemptId || undefined,
        formId: form.id,
        formVersionId: form.publishedVersionId,
        startedAt: new Date(),
        submittedAt: null,
        countryCode: metadata?.countryCode || null,
        browserName: metadata?.browserName || null,
        browserVersion: metadata?.browserVersion || null,
        osName: metadata?.osName || null,
        osVersion: metadata?.osVersion || null,
        deviceType: metadata?.deviceType || null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create submission record");
    }

    return {
      submissionId: created.id,
      formId: created.formId,
      formVersionId: created.formVersionId,
      startedAt: created.startedAt,
      isExistingAttempt: false,
    };
  }

  /**
   * Stage 2: Completes a submission attempt.
   * Atomically locks the attempt, checks limits, validates answers against the exact published snapshot,
   * writes all form_answers rows, and updates submittedAt in a single database transaction.
   */
  public async completeSubmission(
    rawInput: CompleteSubmissionInput
  ): Promise<CompleteSubmissionResult> {
    const input = completeSubmissionInputSchema.parse(rawInput);

    return await db.transaction(async (tx) => {
      // 1. Lock the submission row to claim it atomically
      const [submission] = await tx
        .select()
        .from(formSubmissionsTable)
        .where(eq(formSubmissionsTable.id, input.submissionId))
        .for("update");

      if (!submission) {
        throw new Error("Submission attempt not found or expired");
      }

      // If already completed (e.g. network retry or double-click), return safe idempotent success
      if (submission.submittedAt !== null) {
        const duration = submission.submittedAt.getTime() - submission.startedAt.getTime();
        return {
          success: true,
          submissionId: submission.id,
          submittedAt: submission.submittedAt,
          completionDurationMs: duration >= 0 ? duration : null,
          alreadyCompleted: true,
        };
      }

      // 2. Lock the parent form row to serialize submission limit verification
      const [form] = await tx
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, submission.formId), isNull(formsTable.deletedAt)))
        .for("update");

      if (!form) {
        throw new Error("Parent form not found or has been deleted");
      }

      if (form.closedAt && new Date() >= form.closedAt) {
        throw new Error("This form is closed and no longer accepting responses");
      }

      if (form.expiresAt && new Date() >= form.expiresAt) {
        throw new Error("This form has expired");
      }

      if (form.maxSubmissions !== null) {
        const [completedCountResult] = await tx
          .select({ count: count() })
          .from(formSubmissionsTable)
          .where(
            and(
              eq(formSubmissionsTable.formId, form.id),
              isNotNull(formSubmissionsTable.submittedAt)
            )
          );

        if (Number(completedCountResult?.count || 0) >= form.maxSubmissions) {
          throw new Error("This form has reached its maximum submission limit");
        }
      }

      // 3. Retrieve immutable snapshot elements for the submission's exact formVersionId
      const versionElements = await tx
        .select()
        .from(formVersionElementsTable)
        .where(eq(formVersionElementsTable.formVersionId, submission.formVersionId))
        .orderBy(asc(formVersionElementsTable.sortOrder));

      if (versionElements.length === 0) {
        throw new Error("Form version has no configured elements");
      }

      const questionElements = versionElements.filter((el) => el.kind === "question");

      // Build fast lookup maps: support both version element id and sourceElementId
      const elementById = new Map(versionElements.map((el) => [el.id, el]));
      const elementBySourceId = new Map(
        versionElements.filter((el) => el.sourceElementId).map((el) => [el.sourceElementId!, el])
      );

      // Track which questions have been answered
      const answeredElementIds = new Set<string>();
      const answersToInsert: Array<{
        submissionId: string;
        formVersionId: string;
        formVersionElementId: string;
        value: JsonValue;
      }> = [];

      for (const answerItem of input.answers) {
        const resolvedElement =
          elementById.get(answerItem.formVersionElementId) ||
          elementBySourceId.get(answerItem.formVersionElementId);

        if (!resolvedElement) {
          throw new Error(`Answer references question ${answerItem.formVersionElementId} which does not belong to this form version.`);
        }

        if (resolvedElement.kind === "content") {
          throw new Error(`Element "${resolvedElement.label || resolvedElement.type}" is a content layout block and cannot accept answers.`);
        }

        if (answeredElementIds.has(resolvedElement.id)) {
          throw new Error(`Duplicate answer provided for question: "${resolvedElement.label || resolvedElement.id}".`);
        }

        answeredElementIds.add(resolvedElement.id);

        // Validate value according to element type and configuration
        const validatedValue = this.validateAnswerValue(resolvedElement, answerItem.value);

        answersToInsert.push({
          submissionId: submission.id,
          formVersionId: submission.formVersionId,
          formVersionElementId: resolvedElement.id,
          value: validatedValue,
        });
      }

      // 4. Check that all required questions in this version snapshot are answered
      for (const question of questionElements) {
        if (question.required && !answeredElementIds.has(question.id)) {
          throw new Error(`Question "${question.label || "Untitled Question"}" is required.`);
        }
      }

      // 5. Persist answer records
      if (answersToInsert.length > 0) {
        await tx.insert(formAnswersTable).values(answersToInsert);
      }

      // 6. Transition submission to completed
      const submittedAt = new Date();
      await tx
        .update(formSubmissionsTable)
        .set({ submittedAt })
        .where(eq(formSubmissionsTable.id, submission.id));

      const duration = submittedAt.getTime() - submission.startedAt.getTime();

      return {
        success: true,
        submissionId: submission.id,
        submittedAt,
        completionDurationMs: duration >= 0 ? duration : null,
        alreadyCompleted: false,
      };
    });
  }

  /**
   * Creator-Facing: Fetches an individual submission by ID with its answers and version question labels.
   * Verifies that the authenticated creator owns the parent form.
   */
  public async getSubmissionById(
    rawInput: GetSubmissionByIdInput,
    userId: string
  ): Promise<SubmissionDetail> {
    const input = getSubmissionByIdInputSchema.parse(rawInput);

    // Verify ownership via join with formsTable
    const [submissionWithForm] = await db
      .select({
        submission: formSubmissionsTable,
        createdBy: formsTable.createdBy,
      })
      .from(formSubmissionsTable)
      .innerJoin(formsTable, eq(formSubmissionsTable.formId, formsTable.id))
      .where(
        and(
          eq(formSubmissionsTable.id, input.submissionId),
          isNull(formsTable.deletedAt)
        )
      )
      .limit(1);

    if (!submissionWithForm || submissionWithForm.createdBy !== userId) {
      throw new Error("Submission not found or you do not have permission to view it");
    }

    const { submission } = submissionWithForm;

    // Fetch answers joined with their version element metadata
    const answersWithElements = await db
      .select({
        id: formAnswersTable.id,
        formVersionElementId: formAnswersTable.formVersionElementId,
        value: formAnswersTable.value,
        createdAt: formAnswersTable.createdAt,
        questionLabel: formVersionElementsTable.label,
        questionType: formVersionElementsTable.type,
        sortOrder: formVersionElementsTable.sortOrder,
      })
      .from(formAnswersTable)
      .innerJoin(
        formVersionElementsTable,
        eq(formAnswersTable.formVersionElementId, formVersionElementsTable.id)
      )
      .where(eq(formAnswersTable.submissionId, submission.id))
      .orderBy(asc(formVersionElementsTable.sortOrder));

    const duration =
      submission.submittedAt && submission.startedAt
        ? submission.submittedAt.getTime() - submission.startedAt.getTime()
        : null;

    return {
      id: submission.id,
      formId: submission.formId,
      formVersionId: submission.formVersionId,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
      completionDurationMs: duration !== null && duration >= 0 ? duration : null,
      countryCode: submission.countryCode,
      browserName: submission.browserName,
      browserVersion: submission.browserVersion,
      osName: submission.osName,
      osVersion: submission.osVersion,
      deviceType: submission.deviceType,
      answers: answersWithElements.map((ans) => ({
        id: ans.id,
        formVersionElementId: ans.formVersionElementId,
        questionLabel: ans.questionLabel,
        questionType: ans.questionType,
        sortOrder: ans.sortOrder,
        value: ans.value,
        createdAt: ans.createdAt,
      })),
    };
  }

  /**
   * Creator-Facing: Lists paginated submissions for a specific form.
   * Verifies creator ownership. By default, returns only completed submissions.
   */
  public async listSubmissionsByFormId(
    rawInput: ListSubmissionsByFormIdInput,
    userId: string
  ): Promise<ListSubmissionsResult> {
    const input = listSubmissionsByFormIdInputSchema.parse(rawInput);

    // Verify creator owns the form
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, input.formId),
          eq(formsTable.createdBy, userId),
          isNull(formsTable.deletedAt)
        )
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found or you do not have permission to view its submissions");
    }

    const filterConditions = [
      eq(formSubmissionsTable.formId, input.formId),
      ...(input.includeInProgress ? [] : [isNotNull(formSubmissionsTable.submittedAt)]),
    ];

    // Total count for pagination
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(formSubmissionsTable)
      .where(and(...filterConditions));

    const totalCount = Number(totalCountResult?.count || 0);
    const offset = (input.page - 1) * input.limit;

    // Paginated list with answer counts
    const submissions = await db
      .select({
        id: formSubmissionsTable.id,
        formId: formSubmissionsTable.formId,
        formVersionId: formSubmissionsTable.formVersionId,
        startedAt: formSubmissionsTable.startedAt,
        submittedAt: formSubmissionsTable.submittedAt,
        countryCode: formSubmissionsTable.countryCode,
        browserName: formSubmissionsTable.browserName,
        browserVersion: formSubmissionsTable.browserVersion,
        osName: formSubmissionsTable.osName,
        osVersion: formSubmissionsTable.osVersion,
        deviceType: formSubmissionsTable.deviceType,
        answersCount: count(formAnswersTable.id),
      })
      .from(formSubmissionsTable)
      .leftJoin(formAnswersTable, eq(formAnswersTable.submissionId, formSubmissionsTable.id))
      .where(and(...filterConditions))
      .groupBy(formSubmissionsTable.id)
      .orderBy(desc(formSubmissionsTable.submittedAt), desc(formSubmissionsTable.id))
      .limit(input.limit)
      .offset(offset);

    const items = submissions.map((sub) => {
      const duration =
        sub.submittedAt && sub.startedAt
          ? sub.submittedAt.getTime() - sub.startedAt.getTime()
          : null;
      return {
        id: sub.id,
        formId: sub.formId,
        formVersionId: sub.formVersionId,
        startedAt: sub.startedAt,
        submittedAt: sub.submittedAt,
        completionDurationMs: duration !== null && duration >= 0 ? duration : null,
        countryCode: sub.countryCode,
        browserName: sub.browserName,
        browserVersion: sub.browserVersion,
        osName: sub.osName,
        osVersion: sub.osVersion,
        deviceType: sub.deviceType,
        answersCount: Number(sub.answersCount || 0),
      };
    });

    const totalPages = Math.ceil(totalCount / input.limit) || 1;

    return {
      items,
      totalCount,
      page: input.page,
      limit: input.limit,
      totalPages,
      hasMore: input.page < totalPages,
    };
  }

  /**
   * Creator-Facing: Aggregates submission statistics for a specific form via SQL.
   * Calculates started count, completed count, completion rate, average duration, and breakdowns.
   */
  public async getSubmissionStatsByFormId(
    rawInput: GetSubmissionStatsByFormIdInput,
    userId: string
  ): Promise<SubmissionStatsResult> {
    const input = getSubmissionStatsByFormIdInputSchema.parse(rawInput);

    // Verify creator ownership
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, input.formId),
          eq(formsTable.createdBy, userId),
          isNull(formsTable.deletedAt)
        )
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found or you do not have permission to view its statistics");
    }

    // 1. Overall counts and duration average
    const [aggregates] = await db
      .select({
        totalStarted: count(),
        totalCompleted: sql<number>`count(*) filter (where ${formSubmissionsTable.submittedAt} is not null)`,
        totalInProgress: sql<number>`count(*) filter (where ${formSubmissionsTable.submittedAt} is null)`,
        avgDurationSec: sql<number | null>`avg(extract(epoch from (${formSubmissionsTable.submittedAt} - ${formSubmissionsTable.startedAt}))) filter (where ${formSubmissionsTable.submittedAt} is not null)`,
      })
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.formId, input.formId));

    const totalStarted = Number(aggregates?.totalStarted || 0);
    const totalCompleted = Number(aggregates?.totalCompleted || 0);
    const totalInProgress = Number(aggregates?.totalInProgress || 0);
    const completionRate = totalStarted > 0 ? Number((totalCompleted / totalStarted).toFixed(4)) : 0;
    const avgSec =
      aggregates && aggregates.avgDurationSec !== null && aggregates.avgDurationSec !== undefined
        ? Math.round(Number(aggregates.avgDurationSec))
        : null;

    // 2. Breakdowns
    const [deviceBreakdown, browserBreakdown, osBreakdown, countryBreakdown] = await Promise.all([
      db
        .select({
          key: sql<string>`coalesce(${formSubmissionsTable.deviceType}, 'unknown')`,
          count: count(),
        })
        .from(formSubmissionsTable)
        .where(
          and(
            eq(formSubmissionsTable.formId, input.formId),
            isNotNull(formSubmissionsTable.submittedAt)
          )
        )
        .groupBy(sql`coalesce(${formSubmissionsTable.deviceType}, 'unknown')`),

      db
        .select({
          key: sql<string>`coalesce(${formSubmissionsTable.browserName}, 'Other')`,
          count: count(),
        })
        .from(formSubmissionsTable)
        .where(
          and(
            eq(formSubmissionsTable.formId, input.formId),
            isNotNull(formSubmissionsTable.submittedAt)
          )
        )
        .groupBy(sql`coalesce(${formSubmissionsTable.browserName}, 'Other')`),

      db
        .select({
          key: sql<string>`coalesce(${formSubmissionsTable.osName}, 'Other')`,
          count: count(),
        })
        .from(formSubmissionsTable)
        .where(
          and(
            eq(formSubmissionsTable.formId, input.formId),
            isNotNull(formSubmissionsTable.submittedAt)
          )
        )
        .groupBy(sql`coalesce(${formSubmissionsTable.osName}, 'Other')`),

      db
        .select({
          key: sql<string>`coalesce(${formSubmissionsTable.countryCode}, 'Unknown')`,
          count: count(),
        })
        .from(formSubmissionsTable)
        .where(
          and(
            eq(formSubmissionsTable.formId, input.formId),
            isNotNull(formSubmissionsTable.submittedAt)
          )
        )
        .groupBy(sql`coalesce(${formSubmissionsTable.countryCode}, 'Unknown')`),
    ]);

    return {
      totalStarted,
      totalCompleted,
      totalInProgress,
      completionRate,
      averageDurationSeconds: avgSec,
      deviceBreakdown: deviceBreakdown.map((b) => ({ key: String(b.key), count: Number(b.count) })),
      browserBreakdown: browserBreakdown.map((b) => ({ key: String(b.key), count: Number(b.count) })),
      osBreakdown: osBreakdown.map((b) => ({ key: String(b.key), count: Number(b.count) })),
      countryBreakdown: countryBreakdown.map((b) => ({ key: String(b.key), count: Number(b.count) })),
    };
  }

  /**
   * Creator-Facing: Lists all submissions across the user's forms with search, filter, and pagination.
   */
  public async listAllSubmissions(
    rawInput: ListAllSubmissionsInput,
    userId: string
  ): Promise<ListAllSubmissionsResult> {
    const input = listAllSubmissionsInputSchema.parse(rawInput);

    // 1. Get user forms
    const userForms = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.createdBy, userId), isNull(formsTable.deletedAt)));

    const formIds = userForms.map((f) => f.id);
    if (formIds.length === 0) {
      return {
        items: [],
        totalCount: 0,
        page: input.page,
        limit: input.limit,
        totalPages: 1,
        hasMore: false,
      };
    }

    const conditions = [
      inArray(formSubmissionsTable.formId, formIds),
    ];

    if (input.formId) {
      if (!formIds.includes(input.formId)) {
        throw new Error("Form not found or you do not have permission to view its submissions");
      }
      conditions.push(eq(formSubmissionsTable.formId, input.formId));
    }

    if (input.status === "completed") {
      conditions.push(isNotNull(formSubmissionsTable.submittedAt));
    } else if (input.status === "in_progress") {
      conditions.push(isNull(formSubmissionsTable.submittedAt));
    }

    if (input.startDate) {
      conditions.push(gte(formSubmissionsTable.startedAt, new Date(input.startDate)));
    }
    if (input.endDate) {
      conditions.push(lte(formSubmissionsTable.startedAt, new Date(input.endDate)));
    }

    // Count matching
    const [countResult] = await db
      .select({ count: count() })
      .from(formSubmissionsTable)
      .innerJoin(formsTable, eq(formSubmissionsTable.formId, formsTable.id))
      .where(
        and(
          ...conditions,
          input.search
            ? sql`(${formsTable.title} ILIKE ${'%' + input.search + '%'} OR ${formSubmissionsTable.id}::text ILIKE ${'%' + input.search + '%'})`
            : undefined
        )
      );

    const totalCount = Number(countResult?.count || 0);
    const offset = (input.page - 1) * input.limit;

    const rows = await db
      .select({
        id: formSubmissionsTable.id,
        formId: formSubmissionsTable.formId,
        formVersionId: formSubmissionsTable.formVersionId,
        startedAt: formSubmissionsTable.startedAt,
        submittedAt: formSubmissionsTable.submittedAt,
        countryCode: formSubmissionsTable.countryCode,
        browserName: formSubmissionsTable.browserName,
        browserVersion: formSubmissionsTable.browserVersion,
        osName: formSubmissionsTable.osName,
        osVersion: formSubmissionsTable.osVersion,
        deviceType: formSubmissionsTable.deviceType,
        formTitle: formsTable.title,
        formStatus: formsTable.status,
        formVisibility: formsTable.visibility,
        answersCount: count(formAnswersTable.id),
      })
      .from(formSubmissionsTable)
      .innerJoin(formsTable, eq(formSubmissionsTable.formId, formsTable.id))
      .leftJoin(formAnswersTable, eq(formAnswersTable.submissionId, formSubmissionsTable.id))
      .where(
        and(
          ...conditions,
          input.search
            ? sql`(${formsTable.title} ILIKE ${'%' + input.search + '%'} OR ${formSubmissionsTable.id}::text ILIKE ${'%' + input.search + '%'})`
            : undefined
        )
      )
      .groupBy(formSubmissionsTable.id, formsTable.id)
      .orderBy(desc(formSubmissionsTable.startedAt), desc(formSubmissionsTable.id))
      .limit(input.limit)
      .offset(offset);

    const items = rows.map((r) => {
      const duration =
        r.submittedAt && r.startedAt ? r.submittedAt.getTime() - r.startedAt.getTime() : null;
      return {
        id: r.id,
        formId: r.formId,
        formVersionId: r.formVersionId,
        startedAt: r.startedAt,
        submittedAt: r.submittedAt,
        completionDurationMs: duration !== null && duration >= 0 ? duration : null,
        countryCode: r.countryCode,
        browserName: r.browserName,
        browserVersion: r.browserVersion,
        osName: r.osName,
        osVersion: r.osVersion,
        deviceType: r.deviceType,
        formTitle: r.formTitle,
        formStatus: r.formStatus,
        formVisibility: r.formVisibility,
        answersCount: Number(r.answersCount || 0),
      };
    });

    const totalPages = Math.ceil(totalCount / input.limit) || 1;

    return {
      items,
      totalCount,
      page: input.page,
      limit: input.limit,
      totalPages,
      hasMore: input.page < totalPages,
    };
  }

  /**
   * Creator-Facing: Aggregates workspace or form-specific analytics with time series and performance metrics.
   */
  public async getAnalytics(
    rawInput: GetAnalyticsInput,
    userId: string
  ): Promise<AnalyticsResult> {
    const input = getAnalyticsInputSchema.parse(rawInput);

    // 1. Get user forms
    const userForms = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        status: formsTable.status,
        visibility: formsTable.visibility,
        shareId: formsTable.shareId,
      })
      .from(formsTable)
      .where(and(eq(formsTable.createdBy, userId), isNull(formsTable.deletedAt)));

    const formIds = userForms.map((f) => f.id);

    if (formIds.length === 0 || (input.formId && !formIds.includes(input.formId))) {
      return {
        overview: {
          totalStarted: 0,
          totalCompleted: 0,
          totalInProgress: 0,
          completionRate: 0,
          averageDurationSeconds: null,
          deviceBreakdown: [],
          browserBreakdown: [],
          osBreakdown: [],
          countryBreakdown: [],
        },
        timeSeries: [],
        formsPerformance: [],
      };
    }

    const targetFormIds = input.formId ? [input.formId] : formIds;

    const baseConditions = [
      inArray(formSubmissionsTable.formId, targetFormIds),
    ];

    if (input.startDate) {
      baseConditions.push(gte(formSubmissionsTable.startedAt, new Date(input.startDate)));
    }
    if (input.endDate) {
      baseConditions.push(lte(formSubmissionsTable.startedAt, new Date(input.endDate)));
    }

    // A. Aggregate metrics
    const [aggregates] = await db
      .select({
        totalStarted: count(),
        totalCompleted: sql<number>`count(*) filter (where ${formSubmissionsTable.submittedAt} is not null)`,
        totalInProgress: sql<number>`count(*) filter (where ${formSubmissionsTable.submittedAt} is null)`,
        avgDurationSec: sql<number | null>`avg(extract(epoch from (${formSubmissionsTable.submittedAt} - ${formSubmissionsTable.startedAt}))) filter (where ${formSubmissionsTable.submittedAt} is not null)`,
      })
      .from(formSubmissionsTable)
      .where(and(...baseConditions));

    const totalStarted = Number(aggregates?.totalStarted || 0);
    const totalCompleted = Number(aggregates?.totalCompleted || 0);
    const totalInProgress = Number(aggregates?.totalInProgress || 0);
    const completionRate = totalStarted > 0 ? Number((totalCompleted / totalStarted).toFixed(4)) : 0;
    const avgSec =
      aggregates && aggregates.avgDurationSec !== null && aggregates.avgDurationSec !== undefined
        ? Math.round(Number(aggregates.avgDurationSec))
        : null;

    // B. Breakdowns (completed only)
    const completedConditions = [...baseConditions, isNotNull(formSubmissionsTable.submittedAt)];

    const [deviceBreakdown, browserBreakdown, osBreakdown, countryBreakdown] = await Promise.all([
      db
        .select({
          key: sql<string>`coalesce(${formSubmissionsTable.deviceType}, 'unknown')`,
          count: count(),
        })
        .from(formSubmissionsTable)
        .where(and(...completedConditions))
        .groupBy(sql`coalesce(${formSubmissionsTable.deviceType}, 'unknown')`),

      db
        .select({
          key: sql<string>`coalesce(${formSubmissionsTable.browserName}, 'Other')`,
          count: count(),
        })
        .from(formSubmissionsTable)
        .where(and(...completedConditions))
        .groupBy(sql`coalesce(${formSubmissionsTable.browserName}, 'Other')`),

      db
        .select({
          key: sql<string>`coalesce(${formSubmissionsTable.osName}, 'Other')`,
          count: count(),
        })
        .from(formSubmissionsTable)
        .where(and(...completedConditions))
        .groupBy(sql`coalesce(${formSubmissionsTable.osName}, 'Other')`),

      db
        .select({
          key: sql<string>`coalesce(${formSubmissionsTable.countryCode}, 'Unknown')`,
          count: count(),
        })
        .from(formSubmissionsTable)
        .where(and(...completedConditions))
        .groupBy(sql`coalesce(${formSubmissionsTable.countryCode}, 'Unknown')`),
    ]);

    // C. Time Series (by day)
    const timeSeriesRows = await db
      .select({
        date: sql<string>`to_char(${formSubmissionsTable.startedAt}, 'YYYY-MM-DD')`,
        started: count(),
        completed: sql<number>`count(*) filter (where ${formSubmissionsTable.submittedAt} is not null)`,
      })
      .from(formSubmissionsTable)
      .where(and(...baseConditions))
      .groupBy(sql`to_char(${formSubmissionsTable.startedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${formSubmissionsTable.startedAt}, 'YYYY-MM-DD')`);

    // Map existing counts by date string
    const timeSeriesMap = new Map(timeSeriesRows.map((r) => [String(r.date), r]));

    // Determine target start and end dates to guarantee a continuous timeline
    const now = new Date();
    const targetEnd = input.endDate ? new Date(input.endDate) : now;
    let targetStart: Date;

    const firstRow = timeSeriesRows[0];
    if (input.startDate) {
      targetStart = new Date(input.startDate);
    } else if (firstRow?.date) {
      const earliestDateStr = String(firstRow.date);
      const earliest = new Date(earliestDateStr);
      const sevenDaysAgo = new Date(targetEnd);
      sevenDaysAgo.setDate(targetEnd.getDate() - 6);
      targetStart = earliest < sevenDaysAgo ? earliest : sevenDaysAgo;
    } else {
      const sevenDaysAgo = new Date(targetEnd);
      sevenDaysAgo.setDate(targetEnd.getDate() - 6);
      targetStart = sevenDaysAgo;
    }

    // Build contiguous daily series so charts always have full readable date baselines
    const filledTimeSeries: Array<{ date: string; started: number; completed: number }> = [];
    const curDate = new Date(targetStart);
    curDate.setUTCHours(0, 0, 0, 0);
    const endUtc = new Date(targetEnd);
    endUtc.setUTCHours(23, 59, 59, 999);

    let dayCounter = 0;
    while (curDate.getTime() <= endUtc.getTime() && dayCounter < 366) {
      const dateStr = curDate.toISOString().slice(0, 10);
      const existing = timeSeriesMap.get(dateStr);
      filledTimeSeries.push({
        date: dateStr,
        started: existing ? Number(existing.started) : 0,
        completed: existing ? Number(existing.completed) : 0,
      });
      curDate.setUTCDate(curDate.getUTCDate() + 1);
      dayCounter++;
    }

    // D. Performance per form
    const formStatsRows = await db
      .select({
        formId: formSubmissionsTable.formId,
        totalStarted: count(),
        totalCompleted: sql<number>`count(*) filter (where ${formSubmissionsTable.submittedAt} is not null)`,
        avgDurationSec: sql<number | null>`avg(extract(epoch from (${formSubmissionsTable.submittedAt} - ${formSubmissionsTable.startedAt}))) filter (where ${formSubmissionsTable.submittedAt} is not null)`,
        lastSubmissionAt: sql<Date | null>`max(${formSubmissionsTable.submittedAt})`,
      })
      .from(formSubmissionsTable)
      .where(and(...baseConditions))
      .groupBy(formSubmissionsTable.formId);

    const formStatsMap = new Map(formStatsRows.map((r) => [r.formId, r]));

    const formsPerformance = userForms
      .filter((f) => targetFormIds.includes(f.id))
      .map((f) => {
        const stats = formStatsMap.get(f.id);
        const started = Number(stats?.totalStarted || 0);
        const completed = Number(stats?.totalCompleted || 0);
        const rate = started > 0 ? Number((completed / started).toFixed(4)) : 0;
        const avg =
          stats?.avgDurationSec !== null && stats?.avgDurationSec !== undefined
            ? Math.round(Number(stats.avgDurationSec))
            : null;

        return {
          formId: f.id,
          title: f.title,
          status: f.status,
          visibility: f.visibility,
          shareId: f.shareId,
          totalStarted: started,
          totalCompleted: completed,
          completionRate: rate,
          avgDurationSeconds: avg,
          lastSubmissionAt: stats?.lastSubmissionAt ? new Date(stats.lastSubmissionAt) : null,
        };
      })
      .sort((a, b) => b.totalCompleted - a.totalCompleted);

    return {
      overview: {
        totalStarted,
        totalCompleted,
        totalInProgress,
        completionRate,
        averageDurationSeconds: avgSec,
        deviceBreakdown: deviceBreakdown.map((b) => ({ key: String(b.key), count: Number(b.count) })),
        browserBreakdown: browserBreakdown.map((b) => ({ key: String(b.key), count: Number(b.count) })),
        osBreakdown: osBreakdown.map((b) => ({ key: String(b.key), count: Number(b.count) })),
        countryBreakdown: countryBreakdown.map((b) => ({ key: String(b.key), count: Number(b.count) })),
      },
      timeSeries: filledTimeSeries,
      formsPerformance,
    };
  }

  /**
   * Creator-Facing: Aggregates question-level distribution and response insights for a specific form.
   */
  public async getQuestionInsights(
    rawInput: GetQuestionInsightsInput,
    userId: string
  ): Promise<QuestionInsightsResult> {
    const input = getQuestionInsightsInputSchema.parse(rawInput);

    // Verify ownership
    const [form] = await db
      .select({ id: formsTable.id, title: formsTable.title })
      .from(formsTable)
      .where(and(eq(formsTable.id, input.formId), eq(formsTable.createdBy, userId), isNull(formsTable.deletedAt)))
      .limit(1);

    if (!form) {
      throw new Error("Form not found or you do not have permission to view question insights");
    }

    // Get total completed submissions for this form
    const [totalCompletedRes] = await db
      .select({ count: count() })
      .from(formSubmissionsTable)
      .where(and(eq(formSubmissionsTable.formId, input.formId), isNotNull(formSubmissionsTable.submittedAt)));

    const totalSubmissions = Number(totalCompletedRes?.count || 0);

    // Find all question elements from all versions of this form
    const questionElements = await db
      .select({
        id: formVersionElementsTable.id,
        label: formVersionElementsTable.label,
        type: formVersionElementsTable.type,
        sortOrder: formVersionElementsTable.sortOrder,
        required: formVersionElementsTable.required,
        config: formVersionElementsTable.config,
      })
      .from(formVersionElementsTable)
      .innerJoin(formVersionsTable, eq(formVersionElementsTable.formVersionId, formVersionsTable.id))
      .where(
        and(
          eq(formVersionsTable.formId, input.formId),
          eq(formVersionElementsTable.kind, "question")
        )
      )
      .orderBy(asc(formVersionElementsTable.sortOrder), asc(formVersionElementsTable.createdAt));

    // Deduplicate questions by label and type if present across multiple versions
    const seenQuestions = new Map<string, typeof questionElements[0]>();
    for (const q of questionElements) {
      const key = `${q.label || "Untitled"}_${q.type}`;
      if (!seenQuestions.has(key)) {
        seenQuestions.set(key, q);
      }
    }
    const uniqueQuestions = Array.from(seenQuestions.values());

    // Fetch answers for this form
    const answers = await db
      .select({
        id: formAnswersTable.id,
        formVersionElementId: formAnswersTable.formVersionElementId,
        value: formAnswersTable.value,
        submittedAt: formSubmissionsTable.submittedAt,
        questionLabel: formVersionElementsTable.label,
        questionType: formVersionElementsTable.type,
      })
      .from(formAnswersTable)
      .innerJoin(formSubmissionsTable, eq(formAnswersTable.submissionId, formSubmissionsTable.id))
      .innerJoin(formVersionElementsTable, eq(formAnswersTable.formVersionElementId, formVersionElementsTable.id))
      .where(and(eq(formSubmissionsTable.formId, input.formId), isNotNull(formSubmissionsTable.submittedAt)));

    // Group answers by question key (label + type)
    const answersByQuestionKey = new Map<string, typeof answers>();
    for (const ans of answers) {
      const key = `${ans.questionLabel || "Untitled"}_${ans.questionType}`;
      const list = answersByQuestionKey.get(key) || [];
      list.push(ans);
      answersByQuestionKey.set(key, list);
    }

    const questionInsights = uniqueQuestions.map((q) => {
      const key = `${q.label || "Untitled"}_${q.type}`;
      const qAnswers = answersByQuestionKey.get(key) || [];
      const totalAnswers = qAnswers.length;

      let distribution: Array<{ optionLabel: string; count: number; percentage: number }> = [];
      let averageScore: number | null = null;
      const recentAnswers: Array<{ id: string; value: any; submittedAt: Date }> = [];

      // Choice-based questions
      if (
        ["single_select", "multi_select", "dropdown", "checkbox"].includes(q.type)
      ) {
        const optionCounts = new Map<string, number>();

        // Prepopulate with configured options if available
        const config = (q.config || {}) as Record<string, any>;
        if (Array.isArray(config.options)) {
          for (const opt of config.options) {
            const optLabel = typeof opt === "string" ? opt : opt.label || opt.value || String(opt);
            optionCounts.set(optLabel, 0);
          }
        }

        for (const ans of qAnswers) {
          if (Array.isArray(ans.value)) {
            for (const val of ans.value) {
              const strVal = String(val);
              optionCounts.set(strVal, (optionCounts.get(strVal) || 0) + 1);
            }
          } else if (ans.value !== undefined && ans.value !== null) {
            const strVal = String(ans.value);
            optionCounts.set(strVal, (optionCounts.get(strVal) || 0) + 1);
          }
        }

        distribution = Array.from(optionCounts.entries()).map(([label, cnt]) => ({
          optionLabel: label,
          count: cnt,
          percentage: totalAnswers > 0 ? Number(((cnt / totalAnswers) * 100).toFixed(1)) : 0,
        }));
      } else if (q.type === "linear_rating" || q.type === "star_rating" || q.type === "number") {
        // Rating distribution & average
        const scoreCounts = new Map<string, number>();
        let sum = 0;
        let validNumCount = 0;

        for (const ans of qAnswers) {
          const num = Number(ans.value);
          if (!isNaN(num)) {
            sum += num;
            validNumCount++;
            const strNum = String(num);
            scoreCounts.set(strNum, (scoreCounts.get(strNum) || 0) + 1);
          }
        }

        averageScore = validNumCount > 0 ? Number((sum / validNumCount).toFixed(1)) : null;

        distribution = Array.from(scoreCounts.entries())
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([label, cnt]) => ({
            optionLabel: label,
            count: cnt,
            percentage: totalAnswers > 0 ? Number(((cnt / totalAnswers) * 100).toFixed(1)) : 0,
          }));
      }

      // Recent text answers (for text / email / any questions)
      for (const ans of qAnswers.slice(0, 10)) {
        if (ans.value !== undefined && ans.value !== null) {
          recentAnswers.push({
            id: ans.id,
            value: ans.value,
            submittedAt: ans.submittedAt ? new Date(ans.submittedAt) : new Date(),
          });
        }
      }

      return {
        elementId: q.id,
        label: q.label || "Untitled Question",
        type: q.type,
        sortOrder: q.sortOrder,
        required: q.required,
        totalAnswers,
        distribution,
        averageScore,
        recentAnswers,
      };
    });

    return {
      formId: form.id,
      formTitle: form.title,
      totalSubmissions,
      questions: questionInsights,
    };
  }

  /**
   * Creator-Facing: Fetches completed submissions formatted for CSV export.
   */
  public async exportSubmissions(
    rawInput: ExportSubmissionsInput,
    userId: string
  ): Promise<ExportSubmissionsResult> {
    const input = exportSubmissionsInputSchema.parse(rawInput);

    const userForms = await db
      .select({ id: formsTable.id, title: formsTable.title })
      .from(formsTable)
      .where(and(eq(formsTable.createdBy, userId), isNull(formsTable.deletedAt)));

    const formIds = userForms.map((f) => f.id);
    const formTitleMap = new Map(userForms.map((f) => [f.id, f.title]));

    if (formIds.length === 0 || (input.formId && !formIds.includes(input.formId))) {
      return {
        columns: ["Submission ID", "Form Title", "Started At", "Submitted At"],
        rows: [],
        filename: "submissions-export.csv",
      };
    }

    const targetFormIds = input.formId ? [input.formId] : formIds;

    const conditions = [
      inArray(formSubmissionsTable.formId, targetFormIds),
    ];

    if (input.status === "completed") {
      conditions.push(isNotNull(formSubmissionsTable.submittedAt));
    } else if (input.status === "in_progress") {
      conditions.push(isNull(formSubmissionsTable.submittedAt));
    }

    if (input.startDate) {
      conditions.push(gte(formSubmissionsTable.startedAt, new Date(input.startDate)));
    }
    if (input.endDate) {
      conditions.push(lte(formSubmissionsTable.startedAt, new Date(input.endDate)));
    }

    const submissions = await db
      .select()
      .from(formSubmissionsTable)
      .where(and(...conditions))
      .orderBy(desc(formSubmissionsTable.submittedAt));

    const submissionIds = submissions.map((s) => s.id);

    const answers = submissionIds.length > 0
      ? await db
          .select({
            submissionId: formAnswersTable.submissionId,
            value: formAnswersTable.value,
            questionLabel: formVersionElementsTable.label,
            questionType: formVersionElementsTable.type,
            sortOrder: formVersionElementsTable.sortOrder,
          })
          .from(formAnswersTable)
          .innerJoin(formVersionElementsTable, eq(formAnswersTable.formVersionElementId, formVersionElementsTable.id))
          .where(inArray(formAnswersTable.submissionId, submissionIds))
          .orderBy(asc(formVersionElementsTable.sortOrder))
      : [];

    const questionColumnsSet = new Set<string>();
    const answersBySubId = new Map<string, Record<string, any>>();

    for (const ans of answers) {
      const qLabel = ans.questionLabel || "Untitled Question";
      questionColumnsSet.add(qLabel);

      const record = answersBySubId.get(ans.submissionId) || {};
      let formattedVal = ans.value;
      if (Array.isArray(ans.value)) {
        formattedVal = ans.value.join(", ");
      } else if (typeof ans.value === "object" && ans.value !== null) {
        formattedVal = JSON.stringify(ans.value);
      }
      record[qLabel] = formattedVal;
      answersBySubId.set(ans.submissionId, record);
    }

    const questionColumns = Array.from(questionColumnsSet);
    const standardColumns = [
      "Submission ID",
      "Form Title",
      "Started At",
      "Submitted At",
      "Duration (s)",
      "Device",
      "Browser",
      "OS",
      "Country",
    ];

    const allColumns = [...standardColumns, ...questionColumns];

    const rows = submissions.map((s) => {
      const duration =
        s.submittedAt && s.startedAt
          ? Math.round((s.submittedAt.getTime() - s.startedAt.getTime()) / 1000)
          : null;

      return {
        submissionId: s.id,
        formTitle: formTitleMap.get(s.formId) || "Untitled Form",
        startedAt: s.startedAt,
        submittedAt: s.submittedAt,
        durationSeconds: duration !== null && duration >= 0 ? duration : null,
        deviceType: s.deviceType,
        browser: s.browserName,
        os: s.osName,
        country: s.countryCode,
        answers: answersBySubId.get(s.id) || {},
      };
    });

    const targetTitle = input.formId ? (formTitleMap.get(input.formId) || "form") : "all-forms";
    const filename = `${targetTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-submissions-${new Date().toISOString().slice(0, 10)}.csv`;

    return {
      columns: allColumns,
      rows,
      filename,
    };
  }

}

export default FormSubmissionService;
