"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
import { Card, CardContent } from "~/components/ui/card";
import { useCompleteOAuthSignIn } from "~/hooks/api/auth";
import { getSafeRedirect } from "~/lib/utils";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeOAuthSignInAsync } = useCompleteOAuthSignIn();
  const hasExecutedRef = React.useRef(false);

  React.useEffect(() => {
    // One-shot execution guard against React StrictMode in development
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const rawRedirect = searchParams.get("redirect");
    const targetRedirect = getSafeRedirect(rawRedirect);

    const completeSignIn = async () => {
      try {
        const response = await completeOAuthSignInAsync({});

        toast.success("Signed in successfully!", {
          description: `Welcome, ${response.fullName || response.email}!`,
        });

        router.replace(targetRedirect);
      } catch (err: unknown) {
        toast.error("Sign-in failed", {
          description: "Could not complete authentication with the provider. Please try again.",
        });

        router.replace("/login?error=oauth_failed");
      }
    };

    void completeSignIn();
  }, [completeOAuthSignInAsync, router, searchParams]);

  return (
    <Card className="border-border/80 bg-card/95 shadow-xs backdrop-blur-xs">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <Spinner className="size-6 text-foreground" />
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Authenticating...
          </h2>
          <p className="text-xs text-muted-foreground">
            Completing sign-in and setting up your workspace.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10 selection:bg-foreground selection:text-background">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <React.Suspense
          fallback={
            <Card className="border-border/80 bg-card/95 shadow-xs backdrop-blur-xs">
              <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                <Spinner className="size-6 text-foreground" />
                <p className="text-xs text-muted-foreground">Loading authentication...</p>
              </CardContent>
            </Card>
          }
        >
          <OAuthCallbackContent />
        </React.Suspense>
      </div>
    </div>
  );
}
