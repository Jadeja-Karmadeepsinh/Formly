import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormlyLogo, FormlySymbol } from "~/components/formly-logo";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service — Formly",
  description: "Terms of Service and conditions for using the Formly platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between items-center px-4 py-8 sm:py-12">
      <header className="flex w-full max-w-2xl items-center justify-between pb-6 border-b border-border">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="Formly homepage">
          <FormlyLogo size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-2xl my-auto py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mt-1">Last updated: October 2026</p>
        </div>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Formly, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">2. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">3. Form Content and Submissions</h2>
          <p>
            You retain ownership of all forms and data submitted through your Formly workspace. Formly does not claim ownership over respondent submissions.
          </p>
        </section>
      </main>

      <footer className="w-full max-w-2xl pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <FormlySymbol size={14} />
          <span>© {new Date().getFullYear()} Formly</span>
        </div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
