import type { Metadata } from "next";
import Link from "next/link";
import { FormlyLogo } from "~/components/formly-logo";
import { ForgotPasswordForm } from "~/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password — Formly",
  description: "Request a password recovery link for your Formly account.",
};

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
