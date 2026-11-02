"use client";

import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import type { RouterInputs, RouterOutputs } from "@formly/trpc/client";

export type FormFieldItem =
  RouterOutputs["formFields"]["listFormFields"][number];
export type FormFieldDetail = RouterOutputs["formFields"]["getFormFieldById"];
export type CreateFormFieldInput =
  RouterInputs["formFields"]["createFormField"];
export type UpdateFormFieldInput =
  RouterInputs["formFields"]["updateFormField"];
export type ReorderFormFieldsInput =
  RouterInputs["formFields"]["reorderFormFields"];
export type SyncFormFieldsInput =
  RouterInputs["formFields"]["syncFormFields"];

export function useFormFields(
  formId: string,
  options?: { enabled?: boolean }
) {
  const query = trpc.formFields.listFormFields.useQuery(
    { formId },
    {
      enabled: Boolean(formId) && (options?.enabled ?? true),
      staleTime: 10 * 1000,
      ...options,
    }
  );

  return {
    fields: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useFormField(
  formId: string,
  id: string,
  options?: { enabled?: boolean }
) {
  const query = trpc.formFields.getFormFieldById.useQuery(
    { formId, id },
    {
      enabled: Boolean(formId && id) && (options?.enabled ?? true),
      staleTime: 10 * 1000,
      ...options,
    }
  );

  return {
    field: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateFormField(formId: string) {
  const utils = trpc.useUtils();

  const mutation = trpc.formFields.createFormField.useMutation({
    onSuccess: async () => {
      await utils.formFields.listFormFields.invalidate({ formId });
      toast.success("Field added");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add field");
    },
  });

  return {
    createFormField: mutation.mutate,
    createFormFieldAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function useUpdateFormField(formId: string) {
  const utils = trpc.useUtils();

  const mutation = trpc.formFields.updateFormField.useMutation({
    onSuccess: async (updated) => {
      await Promise.all([
        utils.formFields.listFormFields.invalidate({ formId }),
        utils.formFields.getFormFieldById.invalidate({
          formId,
          id: updated.id,
        }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update field");
    },
  });

  return {
    updateFormField: mutation.mutate,
    updateFormFieldAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function useDeleteFormField(formId: string) {
  const utils = trpc.useUtils();

  const mutation = trpc.formFields.deleteFormField.useMutation({
    onSuccess: async () => {
      await utils.formFields.listFormFields.invalidate({ formId });
      toast.success("Field deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete field");
    },
  });

  return {
    deleteFormField: mutation.mutate,
    deleteFormFieldAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function useSyncFormFields(formId: string) {
  const utils = trpc.useUtils();

  const mutation = trpc.formFields.syncFormFields.useMutation({
    onSuccess: async (data) => {
      utils.formFields.listFormFields.setData({ formId }, data);
      await utils.formFields.listFormFields.invalidate({ formId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync fields");
    },
  });

  return {
    syncFormFields: mutation.mutate,
    syncFormFieldsAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function useReorderFormFields(formId: string) {
  const utils = trpc.useUtils();

  const mutation = trpc.formFields.reorderFormFields.useMutation({
    onSuccess: async () => {
      await utils.formFields.listFormFields.invalidate({ formId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder fields");
    },
  });

  return {
    reorderFormFields: mutation.mutate,
    reorderFormFieldsAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

