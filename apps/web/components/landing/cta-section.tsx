"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "~/components/ui/button";
import { FormlySymbol } from "~/components/formly-logo";

export function LandingCTASection() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 border-t border-border/50">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-3xl border border-border/80 bg-card p-8 sm:p-14 lg:p-20 text-center shadow-lg overflow-hidden">
          {/* Subtle background architectural grid */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"
            aria-hidden="true"
          />

          {/* Formly Symbol Mark Lockup */}
          <div className="flex justify-center mb-6">
            <div className="size-12 rounded-2xl border border-border/80 bg-muted/30 flex items-center justify-center text-foreground shadow-2xs">
              <FormlySymbol size={24} />
            </div>
          </div>

          {/* Core Conversion Copy */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Your next great form starts here.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
            Bring your questions, ideas, and responses together with Formly. Build fluid, beautiful forms on a calm, document-first canvas.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/signup">
              <Button size="lg" className="h-11 px-7 text-sm font-medium gap-2 shadow-xs">
                Start building free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium">
                Sign in
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Free to start · No credit card required · Instant setup
          </p>
        </div>
      </div>
    </section>
  );
}

