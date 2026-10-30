"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Link2, Shield, Laptop, LogOut, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { FormlyBadge } from "~/components/formly-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import {
  useAccounts,
  useLinkSocial,
  useUnlinkAccount,
  useLogoutAll,
  useResendVerification,
} from "~/hooks/api/auth";

interface AccountSettingsFormProps {
  user: {
    id: string;
    name: string;
    fullName?: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
  };
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const searchParams = useSearchParams();
  const { accounts, isLoading: isLoadingAccounts, refetch } = useAccounts();
  const { linkSocialAsync, isPending: isLinking, pendingProvider } = useLinkSocial();
  const { unlinkAccountAsync, isPending: isUnlinking } = useUnlinkAccount();
  const { logoutAll, isPending: isLoggingOutAll } = useLogoutAll();
  const { resendVerificationAsync, isPending: isResendingVerification } = useResendVerification();
  const [resendCooldown, setResendCooldown] = React.useState<number>(0);

  // Handle URL feedback from OAuth linking
  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam.includes("already_linked") || errorParam.includes("ACCOUNT_ALREADY_LINKED")) {
        toast.error("Account already in use", {
          description: "This social account is already linked to another Formly user.",
        });
      } else {
        toast.error("Connection failed", {
          description: "Could not link social account. Please try again.",
        });
      }
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        window.history.replaceState({}, "", url.pathname);
      }
    }
  }, [searchParams]);

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const googleAccount = accounts?.find((acc) => acc.providerId === "google");
  const githubAccount = accounts?.find((acc) => acc.providerId === "github");
  const hasCredential = accounts?.some((acc) => acc.providerId === "credential") ?? true;
  const totalMethods = (accounts?.length || 1);

  const handleLink = async (provider: "google" | "github") => {
    try {
      await linkSocialAsync(provider, "/dashboard/settings/account");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to connect ${provider}`;
      toast.error(msg);
    }
  };

  const handleUnlink = async (accountId: string, providerName: string) => {
    if (totalMethods <= 1 && !hasCredential) {
      toast.error("Cannot disconnect", {
        description: "You must have at least one login method connected to your account.",
      });
      return;
    }

    try {
      await unlinkAccountAsync(accountId);
      toast.success("Account disconnected", {
        description: `Successfully disconnected ${providerName}.`,
      });
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to disconnect ${providerName}`;
      toast.error(msg);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResendingVerification) return;
    try {
      await resendVerificationAsync({ email: user.email });
      setResendCooldown(60);
      toast.success("Verification link sent", {
        description: `Instructions have been sent to ${user.email}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send verification email.";
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* ================= 1. PROFILE & EMAIL VERIFICATION ================= */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />
            Account Profile
          </CardTitle>
          <CardDescription>
            Your Formly identity and verified contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 pb-2">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="size-12 rounded-xl object-cover border border-border"
              />
            ) : (
              <FormlyBadge size="xl" />
            )}
            <div>
              <p className="font-semibold text-foreground text-base leading-tight">
                {user.fullName || user.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <span className="text-xs text-muted-foreground">Full Name</span>
              <p className="font-medium text-foreground">{user.fullName || user.name}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Email Address</span>
                {user.emailVerified ? (
                  <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 text-xs py-0 h-5">
                    <Check className="size-3 mr-1" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-500/20 bg-amber-500/5 text-xs py-0 h-5">
                    <AlertCircle className="size-3 mr-1" /> Unverified
                  </Badge>
                )}
              </div>
              <p className="font-medium text-foreground truncate">{user.email}</p>
            </div>
          </div>

          {!user.emailVerified && (
            <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>Your email is not verified yet. Verify it to secure your account.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || isResendingVerification}
                className="h-7 text-xs font-normal"
              >
                {isResendingVerification ? (
                  <>
                    <Spinner className="size-3 mr-1" /> Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Send verification email"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= 2. CONNECTED ACCOUNTS (ACCOUNT LINKING) ================= */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Link2 className="size-4 text-muted-foreground" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Connect your Google or GitHub account to sign in with social authentication. Provider permissions and scopes are managed safely through Better Auth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingAccounts ? (
            <div className="py-6 flex justify-center">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-lg border border-border/60">
              {/* Google Connection Item */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-card shadow-xs">
                    <svg className="size-4.5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">Google</span>
                      {googleAccount ? (
                        <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 text-xs py-0 h-4.5">
                          Connected
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not connected</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {googleAccount
                        ? "You can sign in to Formly using your Google account."
                        : "Connect your Google account for one-click social sign-in."}
                    </p>
                  </div>
                </div>

                <div>
                  {googleAccount ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlink(googleAccount.id, "Google")}
                      disabled={isUnlinking}
                      className="text-xs font-normal text-destructive hover:text-destructive hover:bg-destructive/5"
                    >
                      {isUnlinking ? <Spinner className="size-3 mr-1" /> : <X className="size-3 mr-1" />}
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLink("google")}
                      disabled={isLinking}
                      className="text-xs font-normal"
                    >
                      {isLinking && pendingProvider === "google" ? (
                        <>
                          <Spinner className="size-3 mr-1" /> Connecting...
                        </>
                      ) : (
                        "Connect Google"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* GitHub Connection Item */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-card shadow-xs">
                    <svg className="size-4.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">GitHub</span>
                      {githubAccount ? (
                        <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 text-xs py-0 h-4.5">
                          Connected
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not connected</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {githubAccount
                        ? "You can sign in to Formly using your GitHub account."
                        : "Connect your GitHub account for one-click social sign-in."}
                    </p>
                  </div>
                </div>

                <div>
                  {githubAccount ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlink(githubAccount.id, "GitHub")}
                      disabled={isUnlinking}
                      className="text-xs font-normal text-destructive hover:text-destructive hover:bg-destructive/5"
                    >
                      {isUnlinking ? <Spinner className="size-3 mr-1" /> : <X className="size-3 mr-1" />}
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLink("github")}
                      disabled={isLinking}
                      className="text-xs font-normal"
                    >
                      {isLinking && pendingProvider === "github" ? (
                        <>
                          <Spinner className="size-3 mr-1" /> Connecting...
                        </>
                      ) : (
                        "Connect GitHub"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= 3. SESSION MANAGEMENT ================= */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Laptop className="size-4 text-muted-foreground" />
            Session Security
          </CardTitle>
          <CardDescription>
            Manage active login sessions across your devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/10 p-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-foreground">Sign out of all other devices</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Revoke all active sessions across any other browsers, laptops, or mobile devices. Your current session will remain active.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logoutAll}
              disabled={isLoggingOutAll}
              className="text-xs font-normal shrink-0"
            >
              {isLoggingOutAll ? (
                <>
                  <Spinner className="size-3 mr-1" /> Revoking...
                </>
              ) : (
                <>
                  <LogOut className="size-3 mr-1" />
                  Log out all other sessions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

