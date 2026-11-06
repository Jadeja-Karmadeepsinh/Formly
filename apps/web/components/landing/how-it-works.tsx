"use client";

import * as React from "react";

const STEPS = [
  {
    step: "01",
    title: "Draft in a document",
    description:
      "Start a new form and write questions directly on a clean page. Use slash commands to insert text inputs, ratings, or dropdowns without leaving your keyboard.",
    detail: "Zero clunky sidebar drag-and-drop",
  },
  {
    step: "02",
    title: "Publish with one click",
    description:
      "Hit Publish to create an immutable version snapshot. Copy your clean 16-character public link and distribute it via email, Slack, or embed.",
    detail: "Automated snapshot versioning",
  },
  {
    step: "03",
    title: "Collect and analyze",
    description:
      "Every response lands directly in your tabular submissions workspace, structured by question and timestamp. Export to CSV anytime.",
    detail: "Strict relational response integrity",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-16 sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Simple Workflow
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            From first question to collected insight in three steps.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
            Form creation doesn&apos;t need to be an overwhelming puzzle. Formly keeps the process linear and transparent.
          </p>
        </div>

        {/* 3 Step Sequence with Connected Progression */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 relative">
          {STEPS.map((item, index) => (
            <div
              key={item.step}
              className="relative flex flex-col justify-between rounded-xl border border-border/70 bg-card p-6 sm:p-8 transition-all duration-200 hover:border-foreground/30 hover:shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground/80">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    Phase {index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border/40 flex items-center gap-2 text-xs font-medium text-foreground">
                <div className="size-4 rounded-full bg-foreground/10 text-foreground flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
