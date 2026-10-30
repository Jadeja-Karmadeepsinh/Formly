import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormlyLogo, FormlySymbol } from "~/components/formly-logo";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy — Formly",
  description: "Privacy policy and data protection practices for the Formly platform.",
};

export default function PrivacyPage() {
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
          <h2 className="text-base font-semibold text-foreground">2. How We Use Information</h2>
          <p>
            Information collected is strictly utilized to operate and deliver the Formly services, provide authentication, and communicate service updates.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">3. Security</h2>
          <p>
            We maintain modern encryption standards for credentials, OAuth account links, and user records. We never sell your personal data.
          </p>
        </section>
      </main>

      <footer className="w-full max-w-2xl pt-6 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <FormlySymbol size={14} />
          <span>© {new Date().getFullYear()} Formly</span>
        </div>
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}
