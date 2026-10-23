import { trpc } from "~/trpc/client";
import { queryClient } from "~/providers/global";

export function useSignUp() {
  const mutation = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess() {
      // Invalidate current user query after signup
      queryClient.invalidateQueries({ queryKey: [["auth", "me"]] });
    },
  });

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
  } = mutation;

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
  const mutation = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess() {
      // Invalidate current user query after signin
      queryClient.invalidateQueries({ queryKey: [["auth", "me"]] });
    },
  });

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
  } = mutation;

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

export function useMe(options?: { enabled?: boolean }) {
  return trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useLogout() {
  const mutation = trpc.auth.logout.useMutation();

  const logout = async () => {
    try {
      await mutation.mutateAsync({});
    } finally {
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return {
    logout,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useLogoutAll() {
  const mutation = trpc.auth.logoutAll.useMutation();

  const logoutAll = async () => {
    try {
      await mutation.mutateAsync({});
    } finally {
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return {
    logoutAll,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useRefresh() {
  return trpc.auth.refresh.useMutation();
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

export function useAuth() {
  const meQuery = useMe();
  const logoutHook = useLogout();
  const logoutAllHook = useLogoutAll();

  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthenticated: Boolean(meQuery.data),
    error: meQuery.error,
    refetch: meQuery.refetch,
    logout: logoutHook.logout,
    logoutAll: logoutAllHook.logoutAll,
    isLoggingOut: logoutHook.isPending || logoutAllHook.isPending,
  };
}

export function useCompleteOAuthSignIn() {
  const mutation = trpc.auth.completeOAuthSignIn.useMutation({
    onSuccess() {
      // Invalidate current user query after oauth completion
      queryClient.invalidateQueries({ queryKey: [["auth", "me"]] });
    },
  });

  const {
    mutateAsync: completeOAuthSignInAsync,
    mutate: completeOAuthSignIn,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    isPending,
    status,
    reset,
    context,
  } = mutation;

  return {
    completeOAuthSignInAsync,
    completeOAuthSignIn,
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

