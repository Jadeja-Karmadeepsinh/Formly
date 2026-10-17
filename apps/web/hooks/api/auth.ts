import { trpc } from "~/trpc/client";

export function useSignUp() {
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    isPending,
    status,
    reset,
    context,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation();

  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    isPending,
    status,
    reset,
    context,
  };
}

export function useSignIn() {
  const {
    mutateAsync: signInUserWithEmailAndPasswordAsync,
    mutate: signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    isPending,
    status,
    reset,
    context,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation();

  return {
    signInUserWithEmailAndPasswordAsync,
    signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    isPending,
    status,
    reset,
    context,
  };
}

export function useForgotPassword() {
  const {
    mutateAsync: requestPasswordResetAsync,
    mutate: requestPasswordReset,
    error,
    isError,
    isPending,
    isSuccess,
    data,
    reset,
  } = trpc.auth.requestPasswordReset.useMutation();

  return {
    requestPasswordResetAsync,
    requestPasswordReset,
    error,
    isError,
    isPending,
    isSuccess,
    data,
    reset,
  };
}

export function useResetPassword() {
  const {
    mutateAsync: resetPasswordAsync,
    mutate: resetPassword,
    error,
    isError,
    isPending,
    isSuccess,
    data,
    reset,
  } = trpc.auth.resetPassword.useMutation();

  return {
    resetPasswordAsync,
    resetPassword,
    error,
    isError,
    isPending,
    isSuccess,
    data,
    reset,
  };
}
