import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Crosshair } from "./frame";
import { FormlySymbol } from "~/components/formly-logo";

export function LandingCTASection() {
  return (
    <div className="relative w-full border-b border-border/80 bg-background overflow-hidden py-16 sm:py-24 lg:py-28">
      {/* Corner Crosshairs */}
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />
      <Crosshair position="bottom-left" />
      <Crosshair position="bottom-right" />

      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-64 w-96 rounded-full bg-foreground/[0.03] blur-3xl" />
      </div>

      <div className="px-4 sm:px-8 text-center max-w-3xl mx-auto space-y-6">
        {/* Formly Symbol Mark */}
        <div className="flex justify-center">
          <div className="size-10 rounded-md border border-border/80 bg-muted/30 flex items-center justify-center text-foreground">
            <FormlySymbol size={20} />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-foreground text-balance">
          Your next great form takes under two minutes.
        </h2>

        {/* Supporting description */}
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[50ch] mx-auto text-pretty">
          Join builders creating thoughtful surveys, event registrations, and internal requests without the clutter of legacy software.
        </p>

        {/* Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button
              size="lg"
              className="h-10 px-6 text-sm font-medium gap-2 shadow-xs active:scale-[0.98] transition-all"
            >
              Start building, it&apos;s free
              <ArrowRight className="size-4 opacity-80" />
            </Button>
          </Link>

          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="h-10 px-5 text-sm font-medium border-border/80 active:scale-[0.98] transition-all"
            >
              Sign in to dashboard
            </Button>
          </Link>
        </div>

        {/* Trust Line */}
        <div className="pt-4 font-mono text-[11px] text-muted-foreground flex items-center justify-center gap-3">
          <span>Free to start</span>
          <span className="opacity-40">•</span>
          <span>No credit card required</span>
          <span className="opacity-40">•</span>
          <span>Instant setup</span>
        </div>
      </div>
    </div>
  );
}
