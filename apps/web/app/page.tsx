"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { FormlyLogo, FormlyBadge, FormlySymbol } from "~/components/formly-logo";
import { ThemeToggle } from "~/components/theme-toggle";
import { trpc } from "~/trpc/client";

export const dynamic = "force-dynamic";

export default function Home() {
  const { data: healthData } = trpc.health.getHealth.useQuery(undefined, {
    retry: false,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="Formly homepage"
          >
            <FormlyLogo size={26} />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 md:py-32">
          {/* Subtle background ambient gradients */}
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-foreground/5 to-foreground/10 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6">
            {/* Brand Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-xs transition-colors hover:bg-muted mb-8">
              <FormlySymbol size={14} className="text-foreground" />
              <span className="font-semibold">Formly Brand</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Next-Gen Form Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Build forms. <br className="hidden sm:inline" />
              <span className="text-muted-foreground">Get real responses.</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
              A beautifully simple way to create forms, collect meaningful feedback, and analyze responses with speed and style.
            </p>

            {/* Call to Actions */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-11 px-6 text-sm gap-2">
                  Start building free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-11 px-6 text-sm">
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left max-w-4xl mx-auto">
              <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
                <CardContent className="p-5 flex flex-col gap-2">
                  <div className="size-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground">
                    <Sparkles className="size-4" />
                  </div>
                  <h3 className="font-semibold text-sm">Fluid Design</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Thoughtfully crafted for both light and dark modes with high-contrast accessibility.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
                <CardContent className="p-5 flex flex-col gap-2">
                  <div className="size-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground">
                    <ShieldCheck className="size-4" />
                  </div>
                  <h3 className="font-semibold text-sm">Secure Authentication</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Powered by Better Auth with session management, email verification, and OAuth.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
                <CardContent className="p-5 flex flex-col gap-2">
                  <div className="size-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground">
                    <Zap className="size-4" />
                  </div>
                  <h3 className="font-semibold text-sm">Instant Analytics</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    End-to-end type safety with tRPC and PostgreSQL database backing your data.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Preview Mock */}
            <div className="mt-16 rounded-xl border border-border/60 bg-card p-2 sm:p-4 shadow-xl">
              <div className="rounded-lg border border-border/40 bg-muted/20 p-6 sm:p-10 flex flex-col items-center justify-center gap-4">
                <FormlyBadge size="xl" />
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight">Formly Form Studio</h2>
                  <p className="text-xs text-muted-foreground">
                    Build intuitive forms that look stunning on any screen.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <span className="flex size-2 rounded-full bg-emerald-500" />
                  <span>API Status: {healthData?.status ? `Online (${healthData.status})` : "Connecting..."}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <FormlyLogo size={20} />
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Formly. Form in Style.
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
