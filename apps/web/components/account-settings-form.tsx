"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Check,
  Copy,
  Github,
  Laptop,
  Link2,
  LogOut,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
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
  const [copiedId, setCopiedId] = React.useState(false);

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
  const totalMethods = accounts?.length || 1;

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      toast.success("User ID copied to clipboard");
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast.error("Failed to copy User ID");
    }
  };

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
      {/* 1. PROFILE & IDENTITY (PAPER FRAMED CONTAINER) */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="p-5 sm:p-6 border-b border-border/60 bg-muted/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="size-13 rounded-2xl object-cover border border-border shadow-xs"
              />
            ) : (
              <div className="size-13 rounded-2xl bg-foreground text-background flex items-center justify-center font-bold text-lg shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-base sm:text-lg leading-tight">
                  {user.fullName || user.name}
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono font-normal uppercase tracking-wider border-border/70 bg-background/80"
                >
                  Workspace Admin
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyUserId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/70 bg-background/80 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
              title="Copy User UUID"
            >
              <span>ID: {user.id.slice(0, 8)}…</span>
              {copiedId ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Display Name
              </span>
              <p className="font-medium text-foreground text-sm">{user.fullName || user.name}</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Email Address
                </span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <Check className="size-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="size-3" />
                    <span>Unverified</span>
                  </span>
                )}
              </div>
              <p className="font-medium text-foreground text-sm truncate">{user.email}</p>
            </div>
          </div>

          {!user.emailVerified && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Your email address is unverified. Verify it to unlock all security features.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || isResendingVerification}
                className="h-7 text-xs font-normal border-amber-500/30 bg-background/80 hover:bg-background shrink-0 cursor-pointer"
              >
                {isResendingVerification ? (
                  <>
                    <Spinner className="size-3 mr-1" /> Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Send Verification Email"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. CONNECTED SOCIAL ACCOUNTS */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="p-5 sm:p-6 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-primary" />
            <h3 className="font-semibold text-foreground text-base">Connected Accounts</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Link social accounts for one-click authentication. Authentication is secured through Better Auth.
          </p>
        </div>

        <div className="divide-y divide-border/60">
          {/* Google Account */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/15 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-card shadow-2xs">
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
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full">
                      <Check className="size-3" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-mono">Not linked</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {googleAccount
                    ? "Sign in to Formly using your verified Google credentials."
                    : "Connect your Google account for passwordless sign-in."}
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
                  className="h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-border/80 cursor-pointer"
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
                  className="h-8 text-xs font-medium border-border/80 hover:bg-muted cursor-pointer"
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

          {/* GitHub Account */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/15 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-card shadow-2xs">
                <Github className="size-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">GitHub</span>
                  {githubAccount ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full">
                      <Check className="size-3" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-mono">Not linked</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {githubAccount
                    ? "Sign in to Formly using your verified GitHub account."
                    : "Connect your GitHub account for developer-friendly login."}
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
                  className="h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-border/80 cursor-pointer"
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
                  className="h-8 text-xs font-medium border-border/80 hover:bg-muted cursor-pointer"
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
      </div>

      {/* 3. SESSION SECURITY */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="p-5 sm:p-6 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Laptop className="size-4 text-primary" />
            <h3 className="font-semibold text-foreground text-base">Active Sessions & Security</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit and terminate active sessions across your browser instances and devices.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/15 p-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground">
                Revoke all other active devices
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Immediately terminates all active cookies and sessions on other browsers, keeping only your current session active.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logoutAll}
              disabled={isLoggingOutAll}
              className="h-8 text-xs font-medium border-border/80 hover:bg-destructive/10 hover:text-destructive shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              {isLoggingOutAll ? (
                <>
                  <Spinner className="size-3 mr-1" /> Terminating...
                </>
              ) : (
                <>
                  <LogOut className="size-3 mr-1.5" />
                  Sign out other devices
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
