"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import { HeroInteractivePreview } from "./interactive-preview";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32">
      {/* Background Architectural Grid Accent */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Editorial Eyebrow Badge */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1 text-xs font-medium text-foreground transition-colors">
            <span className="size-1.5 rounded-full bg-foreground" />
            <span className="tracking-wide uppercase text-[11px] font-semibold text-muted-foreground">
              A Better Way to Collect Responses
            </span>
          </div>
        </div>

        {/* Primary Editorial Headline */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground text-balance">
            Create forms.
            <br />
            <span className="text-muted-foreground font-semibold">
              Collect what matters.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg lg:text-xl text-pretty leading-relaxed">
            Create thoughtful forms with a document-first editor, publish in seconds, and bring every response into one calm, organized workspace.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/signup">
              <Button size="lg" className="h-11 px-6 text-sm font-medium gap-2 shadow-xs">
                Start building free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#showcase">
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium">
                See how it works
              </Button>
            </a>
          </div>

          {/* Honest Capability Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-foreground/60" />
              Document-first inline typing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-foreground/60" />
              Immutable snapshot versioning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-foreground/60" />
              No credit card required
            </span>
          </div>
        </div>

        {/* Hero Interactive Product Demonstration */}
        <div className="mt-14 sm:mt-20">
          <HeroInteractivePreview />
        </div>
      </div>
    </section>
  );
}
