import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "~/components/signup-form";
import { FormlyLogo } from "~/components/formly-logo";

export const metadata: Metadata = {
  title: "Create an account — Formly",
  description: "Create your Formly account to start building beautiful forms.",
};

export default function SignupPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10 selection:bg-foreground selection:text-background">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md p-1"
          aria-label="Formly homepage"
        >
          <FormlyLogo size={28} />
        </Link>
        <React.Suspense fallback={null}>
          <SignupForm />
        </React.Suspense>
      </div>
    </div>
  );
}

