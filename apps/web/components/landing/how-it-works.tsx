import * as React from "react";
import { SectionHeader, Crosshair } from "./frame";
import { CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    number: "01",
    eyebrow: "DRAFT",
    title: "Write your form inline",
    description:
      "Type questions and descriptions freely on a continuous document canvas. Press / to insert rating scales, single choices, or email inputs in seconds.",
    bullets: ["Zero clunky sidebar modals", "Full keyboard shortcut support", "Real-time draft auto-saving"],
  },
  {
    number: "02",
    eyebrow: "PUBLISH",
    title: "Freeze a clean snapshot",
    description:
      "When you hit Publish, Formly locks an immutable schema snapshot. Your shareable link goes live instantly with zero caching delays or downtime.",
    bullets: ["Cryptographic version tagging", "Public or unlisted link access", "Safe live form editing"],
  },
  {
    number: "03",
    eyebrow: "UNDERSTAND",
    title: "Analyze responses with clarity",
    description:
      "Inspect submitted answers one by one or review aggregated completion rates, drop-off trends, and device metrics in the built-in analytics dashboard.",
    bullets: ["Per-question response analysis", "One-click CSV data export", "Guaranteed field schema alignment"],
  },
];

const METRICS = [
  { value: "18+", label: "SUPPORTED QUESTION TYPES", detail: "Rating, choices, email, text & more" },
  { value: "100%", label: "SNAPSHOT INTEGRITY", detail: "Zero response corruption on edits" },
  { value: "<50ms", label: "KEYSTROKE LATENCY", detail: "Optimized document-first editor" },
  { value: "0", label: "THIRD-PARTY TRACKERS", detail: "Pure privacy-first respondent experience" },
];

export function LandingHowItWorks() {
  return (
    <div id="workflow" className="relative w-full">
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* Section Header */}
      <div className="px-4 sm:px-8 py-12 sm:py-16 border-b border-border/80 bg-background">
        <SectionHeader
          index="03"
          eyebrow="The Workflow"
          title="From first question to collected data in three steps."
          description="How Formly replaces hours of form builder configuration with a clear, reliable workflow."
        />
      </div>

      {/* 3-Column Step Grid: Lined grid with divide-x */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/80 border-b border-border/80">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="group p-6 sm:p-8 flex flex-col justify-between hover:bg-muted/15 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-semibold tracking-tighter text-foreground/80 group-hover:text-foreground transition-colors">
                  {step.number}
                </span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded border border-border/60 bg-muted/30">
                  {step.eyebrow}
                </span>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            <ul className="mt-6 pt-4 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
              {step.bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Platform Metrics Bar: Vite / chanhdai tabular stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border/80 border-b border-border/80 bg-muted/10">
        {METRICS.map((m, i) => (
          <div key={i} className="p-5 sm:p-6 text-center group hover:bg-muted/20 transition-colors">
            <div className="font-mono text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {m.value}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              {m.label}
            </div>
            <div className="text-[11px] text-muted-foreground/80 mt-0.5">
              {m.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
