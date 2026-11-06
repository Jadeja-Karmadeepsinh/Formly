import { TRPCError } from "@trpc/server";
import { formSubmissionService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  startSubmissionInputSchema,
  startSubmissionResultSchema,
  completeSubmissionInputSchema,
  completeSubmissionResultSchema,
  getSubmissionByIdInputSchema,
  submissionDetailSchema,
  listSubmissionsByFormIdInputSchema,
  listSubmissionsResultSchema,
  getSubmissionStatsByFormIdInputSchema,
  submissionStatsResultSchema,
  listAllSubmissionsInputSchema,
  listAllSubmissionsResultSchema,
  getAnalyticsInputSchema,
  analyticsResultSchema,
  getQuestionInsightsInputSchema,
  questionInsightsResultSchema,
  exportSubmissionsInputSchema,
  exportSubmissionsResultSchema,
  type SubmissionMetadata,
} from "./model";

const TAGS = ["Form Submissions"];
const getPath = generatePath("/form-submissions");

/**
 * Parses user agent and headers from context into trusted submission metadata.
 */
function extractSubmissionMetadata(
  userAgent?: string,
  headers?: Headers
): SubmissionMetadata {
  let countryCode: string | null = null;
  if (headers) {
    const rawCountry =
      headers.get("cf-ipcountry") ||
      headers.get("x-vercel-ip-country") ||
      headers.get("x-country-code") ||
      headers.get("cloudfront-viewer-country");
    if (rawCountry && /^[a-zA-Z]{2}$/.test(rawCountry)) {
      countryCode = rawCountry.toUpperCase();
    }
  }

  if (!userAgent) {
    return {
      countryCode,
      browserName: null,
      browserVersion: null,
      osName: null,
      osVersion: null,
      deviceType: "unknown",
    };
  }

  // Device detection
  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "desktop";
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (/(mobi|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini)/i.test(userAgent)) {
    deviceType = "mobile";
  }

  // Browser detection
  let browserName: string | null = null;
  let browserVersion: string | null = null;

  const edgeMatch = userAgent.match(/(?:edg|edge|edga|edgios)\/(\d+(?:\.\d+)?)/i);
  const chromeMatch = userAgent.match(/(?:chrome|crios)\/(\d+(?:\.\d+)?)/i);
  const firefoxMatch = userAgent.match(/(?:firefox|fxios)\/(\d+(?:\.\d+)?)/i);
  const safariMatch = userAgent.match(/version\/(\d+(?:\.\d+)?).*safari/i);
  const operaMatch = userAgent.match(/(?:opr|opera)\/(\d+(?:\.\d+)?)/i);

  if (edgeMatch?.[1]) {
    browserName = "Edge";
    browserVersion = edgeMatch[1];
  } else if (operaMatch?.[1]) {
    browserName = "Opera";
    browserVersion = operaMatch[1];
  } else if (chromeMatch?.[1]) {
    browserName = "Chrome";
    browserVersion = chromeMatch[1];
  } else if (firefoxMatch?.[1]) {
    browserName = "Firefox";
    browserVersion = firefoxMatch[1];
  } else if (safariMatch?.[1]) {
    browserName = "Safari";
    browserVersion = safariMatch[1];
  }

  // OS detection
  let osName: string | null = null;
  let osVersion: string | null = null;

  const winMatch = userAgent.match(/windows nt (\d+(?:\.\d+)?)/i);
  const macMatch = userAgent.match(/mac os x (\d+[._\d]+)/i);
  const iosMatch = userAgent.match(/(?:iphone|ipad|ipod).*os (\d+[._\d]+)/i);
  const androidMatch = userAgent.match(/android (\d+(?:\.\d+)?)/i);

  if (winMatch?.[1]) {
    osName = "Windows";
    osVersion = winMatch[1];
  } else if (iosMatch?.[1]) {
    osName = "iOS";
    osVersion = iosMatch[1].replace(/_/g, ".");
  } else if (macMatch?.[1]) {
    osName = "macOS";
    osVersion = macMatch[1].replace(/_/g, ".");
  } else if (androidMatch?.[1]) {
    osName = "Android";
    osVersion = androidMatch[1];
  } else if (/linux/i.test(userAgent)) {
    osName = "Linux";
  } else if (/cros/i.test(userAgent)) {
    osName = "Chrome OS";
  }

  return {
    countryCode,
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType,
  };
}

export const formSubmissionsRouter = router({
  /**
   * Public: Start a submission attempt for a published public form.
   */
  startSubmission: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/startSubmission"),
        tags: TAGS,
      },
    })
    .input(startSubmissionInputSchema)
    .output(startSubmissionResultSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const metadata = extractSubmissionMetadata(ctx.userAgent, ctx.headers);
        return await formSubmissionService.startSubmission(input, metadata);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("invalid")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start submission attempt",
        });
      }
    }),

  /**
   * Public: Complete a submission attempt with respondent answers.
   */
  completeSubmission: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/completeSubmission"),
        tags: TAGS,
      },
    })
    .input(completeSubmissionInputSchema)
    .output(completeSubmissionResultSchema)
    .mutation(async ({ input }) => {
      try {
        return await formSubmissionService.completeSubmission(input);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to complete submission",
        });
      }
    }),

  /**
   * Protected: Get an individual submission by ID (owner only).
   */
  getSubmissionById: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getSubmissionById/{submissionId}"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getSubmissionByIdInputSchema)
    .output(submissionDetailSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await formSubmissionService.getSubmissionById(input, ctx.user.id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("permission")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve submission",
        });
      }
    }),

  /**
   * Protected: List paginated submissions for a specific form (owner only).
   */
  listSubmissionsByFormId: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listSubmissionsByFormId"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(listSubmissionsByFormIdInputSchema)
    .output(listSubmissionsResultSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await formSubmissionService.listSubmissionsByFormId(input, ctx.user.id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("permission")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list submissions",
        });
      }
    }),

  /**
   * Protected: Aggregate statistics for a specific form (owner only).
   */
  getSubmissionStatsByFormId: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getSubmissionStatsByFormId"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getSubmissionStatsByFormIdInputSchema)
    .output(submissionStatsResultSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await formSubmissionService.getSubmissionStatsByFormId(input, ctx.user.id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("permission")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve submission statistics",
        });
      }
    }),

  /**
   * Protected: List all submissions across user's forms with search, filter & pagination.
   */
  listAllSubmissions: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listAllSubmissions"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(listAllSubmissionsInputSchema)
    .output(listAllSubmissionsResultSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await formSubmissionService.listAllSubmissions(input, ctx.user.id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("permission")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list submissions",
        });
      }
    }),

  /**
   * Protected: Get analytics overview, time series, and forms performance.
   */
  getAnalytics: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getAnalytics"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getAnalyticsInputSchema)
    .output(analyticsResultSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await formSubmissionService.getAnalytics(input, ctx.user.id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("permission")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate analytics",
        });
      }
    }),

  /**
   * Protected: Get question-level distribution insights for a form.
   */
  getQuestionInsights: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getQuestionInsights"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getQuestionInsightsInputSchema)
    .output(questionInsightsResultSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await formSubmissionService.getQuestionInsights(input, ctx.user.id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("permission")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate question insights",
        });
      }
    }),

  /**
   * Protected: Export submissions data for CSV download.
   */
  exportSubmissions: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/exportSubmissions"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(exportSubmissionsInputSchema)
    .output(exportSubmissionsResultSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await formSubmissionService.exportSubmissions(input, ctx.user.id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("permission")) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export submissions",
        });
      }
    }),
});
