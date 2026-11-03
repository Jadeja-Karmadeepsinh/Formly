"use client";

import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import type { RouterInputs, RouterOutputs } from "@formly/trpc/client";

export type FormItem = RouterOutputs["forms"]["listFormsByUserId"][number];
export type FormDetail = RouterOutputs["forms"]["getFormById"];
export type PublicFormDetail = RouterOutputs["forms"]["getPublicFormByShareId"];
export type CreateFormInput = RouterInputs["forms"]["createForm"];
export type UpdateFormInput = RouterInputs["forms"]["updateFormById"];
export type FormVersionItem = RouterOutputs["forms"]["listFormVersions"][number];
export type FormVersionDetail = RouterOutputs["forms"]["getFormVersionById"];
export type SaveFormDraftInput = RouterInputs["forms"]["saveFormDraft"];
export type RestoreFormVersionInput = RouterInputs["forms"]["restoreFormVersion"];

export function useForms(options?: { enabled?: boolean }) {
  const query = trpc.forms.listFormsByUserId.useQuery(undefined, {
    staleTime: 30 * 1000,
    ...options,
  });

  return {
    forms: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useForm(id: string, options?: { enabled?: boolean }) {
  const query = trpc.forms.getFormById.useQuery(
    { id },
    {
      enabled: Boolean(id) && (options?.enabled ?? true),
      staleTime: 30 * 1000,
      ...options,
    }
  );

  return {
    form: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateForm() {
  const utils = trpc.useUtils();

  const mutation = trpc.forms.createForm.useMutation({
    onSuccess: async () => {
      await utils.forms.listFormsByUserId.invalidate();
      toast.success("Form created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create form");
    },
  });

  return {
    createForm: mutation.mutate,
    createFormAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function useUpdateForm() {
  const utils = trpc.useUtils();

  const mutation = trpc.forms.updateFormById.useMutation({
    onSuccess: async (updatedForm) => {
      await Promise.all([
        utils.forms.listFormsByUserId.invalidate(),
        utils.forms.getFormById.invalidate({ id: updatedForm.id }),
      ]);
      toast.success("Form updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update form");
    },
  });

  return {
    updateForm: mutation.mutate,
    updateFormAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function usePublishForm() {
  const utils = trpc.useUtils();

  const mutation = trpc.forms.publishForm.useMutation({
    onSuccess: async (published) => {
      await Promise.all([
        utils.forms.listFormsByUserId.invalidate(),
        utils.forms.getFormById.invalidate({ id: published.id }),
        utils.forms.listFormVersions.invalidate({ formId: published.id }),
        published.shareId
          ? utils.forms.getPublicFormByShareId.invalidate({ shareId: published.shareId })
          : Promise.resolve(),
      ]);
      toast.success("Form published successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish form");
    },
  });

  return {
    publishForm: mutation.mutate,
    publishFormAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function useUnpublishForm() {
  const utils = trpc.useUtils();

  const mutation = trpc.forms.unpublishForm.useMutation({
    onSuccess: async (unpublished) => {
      await Promise.all([
        utils.forms.listFormsByUserId.invalidate(),
        utils.forms.getFormById.invalidate({ id: unpublished.id }),
        utils.forms.listFormVersions.invalidate({ formId: unpublished.id }),
        unpublished.shareId
          ? utils.forms.getPublicFormByShareId.invalidate({ shareId: unpublished.shareId })
          : Promise.resolve(),
      ]);
      toast.success("Form unpublished (moved to draft)");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unpublish form");
    },
  });

  return {
    unpublishForm: mutation.mutate,
    unpublishFormAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function usePublicForm(shareId: string, options?: { enabled?: boolean }) {
  const query = trpc.forms.getPublicFormByShareId.useQuery(
    { shareId },
    {
      enabled: Boolean(shareId) && (options?.enabled ?? true),
      staleTime: 60 * 1000,
      ...options,
    }
  );

  return {
    data: query.data ?? null,
    form: query.data?.form ?? null,
    fields: query.data?.fields ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeleteForm() {
  const utils = trpc.useUtils();

  const mutation = trpc.forms.deleteFormById.useMutation({
    onSuccess: async () => {
      await utils.forms.listFormsByUserId.invalidate();
      toast.success("Form deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete form");
    },
  });

  return {
    deleteForm: mutation.mutate,
    deleteFormAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ==========================================
// Form Versioning Hooks
// ==========================================

export function useSaveFormDraft() {
  const utils = trpc.useUtils();

  const mutation = trpc.forms.saveFormDraft.useMutation({
    onSuccess: async (result) => {
      await Promise.all([
        utils.forms.getFormById.invalidate({ id: result.form.id }),
        utils.formFields.listFormFields.invalidate({ formId: result.form.id }),
        utils.forms.listFormVersions.invalidate({ formId: result.form.id }),
        utils.forms.listFormsByUserId.invalidate(),
        result.form.shareId
          ? utils.forms.getPublicFormByShareId.invalidate({ shareId: result.form.shareId })
          : Promise.resolve(),
      ]);
    },
  });

  return {
    saveFormDraft: mutation.mutate,
    saveFormDraftAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function useFormVersions(formId: string, options?: { enabled?: boolean }) {
  const query = trpc.forms.listFormVersions.useQuery(
    { formId },
    {
      enabled: Boolean(formId) && (options?.enabled ?? true),
      staleTime: 10 * 1000,
      ...options,
    }
  );

  return {
    versions: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useFormVersion(
  params: { formId: string; versionId?: string; versionNumber?: number },
  options?: { enabled?: boolean }
) {
  const query = trpc.forms.getFormVersionById.useQuery(params, {
    enabled:
      Boolean(params.formId) &&
      (Boolean(params.versionId) || params.versionNumber !== undefined) &&
      (options?.enabled ?? true),
    staleTime: 30 * 1000,
    ...options,
  });

  return {
    data: query.data ?? null,
    version: query.data?.version ?? null,
    elements: query.data?.elements ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRestoreFormVersion() {
  const utils = trpc.useUtils();

  const mutation = trpc.forms.restoreFormVersion.useMutation({
    onSuccess: async (result) => {
      await Promise.all([
        utils.forms.getFormById.invalidate({ id: result.form.id }),
        utils.formFields.listFormFields.invalidate({ formId: result.form.id }),
        utils.forms.listFormVersions.invalidate({ formId: result.form.id }),
        utils.forms.listFormsByUserId.invalidate(),
        result.form.shareId
          ? utils.forms.getPublicFormByShareId.invalidate({ shareId: result.form.shareId })
          : Promise.resolve(),
      ]);
      toast.success(`Restored to Version ${result.version.versionNumber}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to restore form version");
    },
  });

  return {
    restoreFormVersion: mutation.mutate,
    restoreFormVersionAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}
