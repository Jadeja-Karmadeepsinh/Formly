"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { FormlyLogo } from "~/components/formly-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { ResetPasswordForm } from "~/components/reset-password-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token")?.trim() || "";
  const errorParam = searchParams.get("error");
  const [token, setToken] = React.useState<string>(rawToken);

  React.useEffect(() => {
    if (rawToken && rawToken !== token) {
      setToken(rawToken);
    }
  }, [rawToken, token]);

  const activeToken = token || rawToken;

  // If Better Auth returned error or token is missing
  if (errorParam || !activeToken) {
    const isExpired = errorParam === "INVALID_TOKEN" || errorParam === "TOKEN_EXPIRED";
    return (
      <Card className="border-border/80 bg-card/95 shadow-xs">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            {isExpired ? "Reset link expired or invalid" : "Invalid reset link"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {isExpired
              ? "This password reset link has expired or has already been used. Please request a new link."
              : "No valid reset token was provided. Please request a new password reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/forgot-password" className="w-full block">
            <Button className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="size-3.5" />
              Request new reset link
            </Button>
          </Link>
          <Link href="/login" className="w-full block">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 font-normal">
              <ArrowLeft className="size-3.5" />
              Back to sign in
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm token={activeToken} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10">
      {/* Strict Referrer Policy: never send reset token in HTTP Referer */}
      <meta name="referrer" content="no-referrer" />

      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md p-1"
          aria-label="Formly homepage"
        >
          <FormlyLogo size={28} />
        </Link>
        <React.Suspense
          fallback={
            <Card className="border-border/80 bg-card/95 shadow-xs">
              <CardContent className="py-12 flex justify-center">
                <Spinner className="size-6 text-foreground" />
              </CardContent>
            </Card>
          }
        >
          <ResetPasswordContent />
        </React.Suspense>
      </div>
    </div>
  );
}
