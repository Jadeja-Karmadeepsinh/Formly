"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

export function LandingDifferentiation() {
  return (
    <section className="py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-16 sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Design Philosophy
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Forms shouldn&apos;t feel like software configuration.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
            Most form tools treat questions like database schemas hidden inside popups and nested menus. Formly treats forms as clear documents.
          </p>
        </div>

        {/* Side-by-side Architectural Comparison */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Traditional Form Builders */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 border-b border-border/50 pb-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">The Old Way</span>
              <h3 className="text-lg font-bold text-foreground">Traditional Form Builders</h3>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                  <X className="size-3 stroke-[2.5]" />
                </div>
                <span>Clunky drag-and-drop sidebars that force constant context switching.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                  <X className="size-3 stroke-[2.5]" />
                </div>
                <span>Editing live questions risks breaking or misaligning older historical answers.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                  <X className="size-3 stroke-[2.5]" />
                </div>
                <span>Noisy interfaces overloaded with bloated configuration dialogs.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                  <X className="size-3 stroke-[2.5]" />
                </div>
                <span>Distracting respondent screens that lead to drop-off and fatigue.</span>
              </li>
            </ul>
          </div>

          {/* The Formly Experience */}
          <div className="rounded-2xl border-2 border-foreground/80 bg-card p-6 sm:p-8 space-y-6 shadow-md">
            <div className="space-y-1 border-b border-border/60 pb-4">
              <span className="text-[11px] font-mono uppercase text-foreground font-semibold">The Formly Way</span>
              <h3 className="text-lg font-bold text-foreground">Direct & Document-First</h3>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-foreground">
              <li className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
                <span>Write forms like a clean document with fluid inline slash commands.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
                <span>Immutable version snapshots ensure past submissions are never corrupted.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
                <span>Minimalist workspace with purposeful controls only when needed.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
                <span>Calm, responsive respondent view designed for high completion rates.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
