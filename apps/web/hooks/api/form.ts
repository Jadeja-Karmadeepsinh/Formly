"use client";

import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import type { RouterInputs, RouterOutputs } from "@formly/trpc/client";

export type FormItem = RouterOutputs["forms"]["listFormsByUserId"][number];
export type FormDetail = RouterOutputs["forms"]["getFormById"];
export type CreateFormInput = RouterInputs["forms"]["createForm"];
export type UpdateFormInput = RouterInputs["forms"]["updateFormById"];

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

