import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormlyLogo } from "~/components/formly-logo";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy — Formly",
  description: "Privacy policy and data protection practices for the Formly platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between items-center px-4 py-8 sm:py-12">
      <header className="flex w-full max-w-2xl items-center justify-between pb-6 border-b border-border">
        <Link href="/" className="inline-flex items-center gap-2">
          <FormlyLogo size={22} />
        </Link>
        <Link href="/login">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to sign in
          </Button>
        </Link>
      </header>

      <main className="w-full max-w-2xl my-auto py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">Last updated: October 2026</p>
        </div>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">1. Data We Collect</h2>
          <p>
            We collect the information you provide directly, such as your email address and password when you register for an account, and the forms you create.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">2. How We Protect Your Data</h2>
          <p>
            Your account passwords are cryptographically hashed using standard secure algorithms. We do not store plain-text passwords and we implement transport encryption across all endpoints.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">3. Form Submissions</h2>
          <p>
            Form respondents’ submissions are stored on behalf of the form creator. We do not sell or monetize submission data.
          </p>
        </section>
      </main>

      <footer className="w-full max-w-2xl pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Formly</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
