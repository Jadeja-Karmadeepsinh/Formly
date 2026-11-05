"use client";

import * as React from "react";
import { FileText, History, Link2, ShieldCheck } from "lucide-react";

const PRINCIPLES = [
  {
    icon: FileText,
    title: "Document-first editing",
    description:
      "Write forms as naturally as a notes document. Type slash commands to insert questions without opening disconnected sidebars.",
  },
  {
    icon: History,
    title: "Snapshot-safe versioning",
    description:
      "Every save captures a frozen version snapshot. You can freely edit questions without ever corrupting or mismatching older answers.",
  },
  {
    icon: Link2,
    title: "Instant public sharing",
    description:
      "Publish in one click with a clean, short 16-character link that renders effortlessly on mobile, tablet, and desktop devices.",
  },
  {
    icon: ShieldCheck,
    title: "Strict response integrity",
    description:
      "Answers are permanently locked to the exact version snapshot respondents saw, backed by a relational PostgreSQL database.",
  },
] as const;

export function LandingPhilosophy() {
  return (
    <section className="border-y border-border/50 bg-muted/20 py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Product Philosophy
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance">
            Everything you need to ask better questions.
          </h2>
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
            Formly is engineered on four foundational principles designed to eliminate the friction, clutter, and fragility of traditional form builders.
          </p>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="group relative rounded-xl border border-border/60 bg-card p-6 transition-all duration-200 hover:border-foreground/30 hover:shadow-xs"
              >
                <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                  <Icon className="size-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight mb-2">
                  {principle.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

