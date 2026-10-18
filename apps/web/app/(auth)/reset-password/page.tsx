"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

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
import { trpc } from "~/trpc/client";
import { ResetPasswordForm } from "~/components/reset-password-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token")?.trim() || "";
  const [token, setToken] = React.useState<string>(rawToken);

  React.useEffect(() => {
    if (rawToken && rawToken !== token) {
      setToken(rawToken);
    }
  }, [rawToken, token]);

  const activeToken = token || rawToken;

  const { data, isLoading } = trpc.auth.verifyResetToken.useQuery(
    { token: activeToken },
    {
      enabled: Boolean(activeToken),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Missing token in initial URL
  if (!activeToken) {
    return (
      <Card className="border-border/80 bg-card/95 shadow-xs">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="size-5" />
            Invalid reset link
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            No reset token was provided. Please request a new password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="w-full block">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Loading skeleton while verifying token with server
  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card/95 shadow-xs">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <Spinner className="size-6 text-foreground" />
          <p className="text-sm text-muted-foreground">Verifying reset link...</p>
        </CardContent>
      </Card>
    );
  }

  // Expired, already used, or invalid token
  if (!data?.valid) {
    return (
      <Card className="border-border/80 bg-card/95 shadow-xs">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="size-5" />
            Link expired or invalid
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            This password reset link is invalid or has expired. Password reset links are valid for 30 minutes and can only be used once.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button className="w-full font-medium">Request a new link</Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full font-normal flex items-center justify-center gap-2">
              <ArrowLeft className="size-4" />
              Back to sign in
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Valid token -> render password reset form
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
          <FormlyLogo size={24} />
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
