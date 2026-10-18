import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "~/components/login-form";
import { FormlyLogo } from "~/components/formly-logo";

export const metadata: Metadata = {
  title: "Sign in — Formly",
  description: "Sign in to your Formly account.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10 selection:bg-foreground selection:text-background">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md p-1"
          aria-label="Formly homepage"
        >
          <FormlyLogo size={24} />
        </Link>
        <React.Suspense fallback={null}>
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}

