"use client";

import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import type { RouterInputs, RouterOutputs } from "@formly/trpc/client";

export type StartSubmissionInput = RouterInputs["formSubmissions"]["startSubmission"];
export type StartSubmissionResult = RouterOutputs["formSubmissions"]["startSubmission"];
export type CompleteSubmissionInput = RouterInputs["formSubmissions"]["completeSubmission"];
export type CompleteSubmissionResult = RouterOutputs["formSubmissions"]["completeSubmission"];
export type SubmissionDetail = RouterOutputs["formSubmissions"]["getSubmissionById"];
export type ListSubmissionsResult = RouterOutputs["formSubmissions"]["listSubmissionsByFormId"];
export type SubmissionListItem = ListSubmissionsResult["items"][number];
export type SubmissionStatsResult = RouterOutputs["formSubmissions"]["getSubmissionStatsByFormId"];

/**
 * Public Hook: Initiates a submission attempt when a respondent opens a public form.
 */
export function useStartSubmission() {
  const mutation = trpc.formSubmissions.startSubmission.useMutation({
    onError: (error) => {
      // Don't show toast if user navigated away or it's a silent attempt failure;
      // let the caller handle it gracefully.
      console.warn("startSubmission error:", error.message);
    },
  });

  return {
    startSubmission: mutation.mutate,
    startSubmissionAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

/**
 * Public Hook: Completes a submission attempt with respondent answers.
 */
export function useCompleteSubmission() {
  const utils = trpc.useUtils();

  const mutation = trpc.formSubmissions.completeSubmission.useMutation({
    onSuccess: async () => {
      // Invalidate submissions cache for creator dashboard if open
      await Promise.all([
        utils.formSubmissions.listSubmissionsByFormId.invalidate(),
        utils.formSubmissions.getSubmissionStatsByFormId.invalidate(),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit form");
    },
  });

  return {
    completeSubmission: mutation.mutate,
    completeSubmissionAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

/**
 * Creator Hook: Fetches an individual submission by ID with answers and question details.
 */
export function useSubmission(submissionId: string, options?: { enabled?: boolean }) {
  const query = trpc.formSubmissions.getSubmissionById.useQuery(
    { submissionId },
    {
      enabled: Boolean(submissionId) && (options?.enabled ?? true),
      staleTime: 60 * 1000,
      ...options,
    }
  );

  return {
    submission: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Creator Hook: Lists paginated submissions for a specific form.
 */
export function useFormSubmissions(
  input: { formId: string; page?: number; limit?: number; includeInProgress?: boolean },
  options?: { enabled?: boolean }
) {
  const query = trpc.formSubmissions.listSubmissionsByFormId.useQuery(
    {
      formId: input.formId,
      page: input.page ?? 1,
      limit: input.limit ?? 20,
      includeInProgress: input.includeInProgress ?? false,
    },
    {
      enabled: Boolean(input.formId) && (options?.enabled ?? true),
      staleTime: 30 * 1000,
      ...options,
    }
  );

  return {
    data: query.data ?? null,
    items: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    page: query.data?.page ?? 1,
    limit: query.data?.limit ?? 20,
    totalPages: query.data?.totalPages ?? 1,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Creator Hook: Fetches aggregated submission statistics for a form.
 */
export function useFormSubmissionStats(formId: string, options?: { enabled?: boolean }) {
  const query = trpc.formSubmissions.getSubmissionStatsByFormId.useQuery(
    { formId },
    {
      enabled: Boolean(formId) && (options?.enabled ?? true),
      staleTime: 60 * 1000,
      ...options,
    }
  );

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
