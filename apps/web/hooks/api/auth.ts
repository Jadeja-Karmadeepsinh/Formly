import * as React from "react";
import { trpc } from "~/trpc/client";
import { queryClient } from "~/providers/global";
import { authClient, useSession } from "~/lib/auth-client";

export function useSignUp() {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<{ message: string } | null>(null);

  const signUpAsync = async (data: { email: string; password: string; name: string }) => {
    setIsPending(true);
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: `${origin}/dashboard`,
      });

      if (res?.error) {
        const err = { message: res.error.message || "Failed to create account" };
        setError(err);
        throw new Error(err.message);
      }

      await queryClient.invalidateQueries({ queryKey: [["auth", "me"]] });
      return res.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError({ message });
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    signUpAsync,
    createUserWithEmailAndPasswordAsync: (values: { fullName: string; email: string; password: string }) =>
      signUpAsync({ email: values.email, password: values.password, name: values.fullName }),
    isPending,
    isError: Boolean(error),
    error,
    reset: () => setError(null),
  };
}

export function useSignIn() {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<{ message: string; isEmailNotVerified?: boolean } | null>(null);

  const signInAsync = async (data: { email: string; password: string }) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        const isEmailNotVerified =
          res.error.code === "EMAIL_NOT_VERIFIED" ||
          res.error.message?.toLowerCase().includes("email not verified") ||
          res.error.message?.toLowerCase().includes("verification");

        const err = {
          message: isEmailNotVerified
            ? "Your email address has not been verified yet. Please check your inbox or resend the verification link below."
            : res.error.message || "Invalid email or password",
          isEmailNotVerified,
        };
        setError(err);
        throw new Error(err.message);
      }

      await queryClient.invalidateQueries({ queryKey: [["auth", "me"]] });
      return res.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError((prev) => prev ?? { message });
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    signInAsync,
    signInUserWithEmailAndPasswordAsync: signInAsync,
    isPending,
    isError: Boolean(error),
    error,
    isEmailNotVerified: Boolean(error?.isEmailNotVerified),
    reset: () => setError(null),
  };
}

export function useSocialSignIn() {
  const [isPending, setIsPending] = React.useState(false);
  const [pendingProvider, setPendingProvider] = React.useState<"google" | "github" | null>(null);
  const [error, setError] = React.useState<{ message: string } | null>(null);

  const signInWithSocial = async (provider: "google" | "github", callbackURL = "/dashboard") => {
    setIsPending(true);
    setPendingProvider(provider);
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullCallbackUrl = callbackURL.startsWith("http") ? callbackURL : `${origin}${callbackURL}`;

      const res = await authClient.signIn.social({
        provider,
        callbackURL: fullCallbackUrl,
        errorCallbackURL: `${origin}/login?error=oauth_failed`,
      });

      if (res?.error) {
        const err = { message: res.error.message || "Failed to connect to provider. Please try again." };
        setError(err);
        throw new Error(err.message);
      }

      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to provider.";
      setError({ message });
      throw err;
    } finally {
      setIsPending(false);
      setPendingProvider(null);
    }
  };

  return {
    signInWithSocial,
    isPending,
    pendingProvider,
    isError: Boolean(error),
    error,
  };
}

export function useResendVerification() {
  const [isPending, setIsPending] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<{ message: string } | null>(null);

  const resendVerificationAsync = async (data: { email: string }) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await authClient.sendVerificationEmail({
        email: data.email,
        callbackURL: `${origin}/dashboard`,
      });

      if (res?.error) {
        const err = { message: res.error.message || "Failed to resend verification email" };
        setError(err);
        throw new Error(err.message);
      }

      setIsSuccess(true);
      return res?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend verification email";
      setError({ message });
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    resendVerificationAsync,
    resendVerification: (data: { email: string }) => void resendVerificationAsync(data),
    isPending,
    isSuccess,
    isError: Boolean(error),
    error,
    reset: () => {
      setError(null);
      setIsSuccess(false);
    },
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
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<{ message: string } | null>(null);

  const logout = async () => {
    setIsPending(true);
    try {
      await authClient.signOut();
    } catch (err: unknown) {
      setError({ message: err instanceof Error ? err.message : "Failed to sign out" });
    } finally {
      setIsPending(false);
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return {
    logout,
    isPending,
    error,
    reset: () => setError(null),
  };
}

export function useLogoutAll() {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<{ message: string } | null>(null);

  const logoutAll = async () => {
    setIsPending(true);
    try {
      await authClient.revokeSessions();
    } catch (err: unknown) {
      setError({ message: err instanceof Error ? err.message : "Failed to sign out from all devices" });
    } finally {
      setIsPending(false);
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return {
    logoutAll,
    isPending,
    error,
    reset: () => setError(null),
  };
}

export function useForgotPassword() {
  const [isPending, setIsPending] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<{ message: string } | null>(null);

  const requestPasswordResetAsync = async (data: { email: string }) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: `${origin}/reset-password`,
      });

      if (res?.error) {
        const err = { message: res.error.message || "Failed to send reset link" };
        setError(err);
        throw new Error(err.message);
      }

      setIsSuccess(true);
      return res?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset link";
      setError({ message });
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    requestPasswordResetAsync,
    requestPasswordReset: (data: { email: string }) => void requestPasswordResetAsync(data),
    isPending,
    isSuccess,
    isError: Boolean(error),
    error,
    reset: () => {
      setError(null);
      setIsSuccess(false);
    },
  };
}

export function useResetPassword() {
  const [isPending, setIsPending] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<{ message: string } | null>(null);

  const resetPasswordAsync = async (data: {
    token: string;
    newPassword: string;
    confirmPassword?: string;
  }) => {
    if (data.confirmPassword && data.newPassword !== data.confirmPassword) {
      const err = { message: "Passwords do not match" };
      setError(err);
      throw new Error(err.message);
    }

    setIsPending(true);
    setError(null);
    setIsSuccess(false);
    try {
      const res = await authClient.resetPassword({
        newPassword: data.newPassword,
        token: data.token,
      });

      if (res?.error) {
        const err = { message: res.error.message || "Invalid or expired reset link" };
        setError(err);
        throw new Error(err.message);
      }

      setIsSuccess(true);
      return res?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      setError({ message });
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    resetPasswordAsync,
    resetPassword: (data: { token: string; newPassword: string; confirmPassword?: string }) =>
      void resetPasswordAsync(data),
    isPending,
    isSuccess,
    isError: Boolean(error),
    error,
    reset: () => {
      setError(null);
      setIsSuccess(false);
    },
  };
}

export interface UserAccountItem {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: string | Date;
}

export function useAccounts() {
  const [accounts, setAccounts] = React.useState<UserAccountItem[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAccounts = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authClient.listAccounts();
      if (res?.error) {
        setError(res.error.message || "Failed to load linked accounts");
      } else if (res?.data) {
        setAccounts(res.data as unknown as UserAccountItem[]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load linked accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    refetch: fetchAccounts,
  };
}

export function useLinkSocial() {
  const [isPending, setIsPending] = React.useState(false);
  const [pendingProvider, setPendingProvider] = React.useState<"google" | "github" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const linkSocialAsync = async (provider: "google" | "github", callbackURL = "/dashboard/settings/account") => {
    setIsPending(true);
    setPendingProvider(provider);
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullCallbackUrl = callbackURL.startsWith("http") ? callbackURL : `${origin}${callbackURL}`;

      const res = await authClient.linkSocial({
        provider,
        callbackURL: fullCallbackUrl,
      });

      if (res?.error) {
        throw new Error(res.error.message || `Failed to connect ${provider}`);
      }
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Failed to connect ${provider}`;
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
      setPendingProvider(null);
    }
  };

  return {
    linkSocialAsync,
    isPending,
    pendingProvider,
    error,
  };
}

export function useUnlinkAccount() {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const unlinkAccountAsync = async (accountId: string) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await authClient.unlinkAccount({
        accountId,
      });

      if (res?.error) {
        throw new Error(res.error.message || "Failed to disconnect account");
      }
      return res?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to disconnect account";
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    unlinkAccountAsync,
    isPending,
    error,
  };
}

export function useAuth() {
  const { data: sessionData, isPending: isSessionPending, error: sessionError } = useSession();
  const meQuery = useMe({ enabled: Boolean(sessionData?.session) });
  const logoutHook = useLogout();
  const logoutAllHook = useLogoutAll();

  const user = meQuery.data
    ? {
        id: meQuery.data.id,
        name: meQuery.data.name,
        fullName: meQuery.data.fullName,
        email: meQuery.data.email,
        image: meQuery.data.image,
      }
    : sessionData?.user
      ? {
          id: sessionData.user.id,
          name: sessionData.user.name,
          fullName: sessionData.user.name,
          email: sessionData.user.email,
          image: sessionData.user.image,
        }
      : null;

  return {
    user,
    session: sessionData?.session || null,
    isLoading: isSessionPending || (Boolean(sessionData?.session) && meQuery.isLoading),
    isAuthenticated: Boolean(sessionData?.session),
    error: sessionError || meQuery.error,
    refetch: meQuery.refetch,
    logout: logoutHook.logout,
    logoutAll: logoutAllHook.logoutAll,
    isLoggingOut: logoutHook.isPending || logoutAllHook.isPending,
  };
}
