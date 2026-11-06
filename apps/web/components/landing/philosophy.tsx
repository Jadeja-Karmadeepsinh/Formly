import * as React from "react";
import { FileText, History, Link2, ShieldCheck } from "lucide-react";
import { Crosshair } from "./frame";

const PRINCIPLES = [
  {
    icon: FileText,
    num: "01",
    title: "Document-First Editing",
    description:
      "Write forms as naturally as a notes document. Type slash commands to insert questions without opening disconnected sidebars.",
  },
  {
    icon: History,
    num: "02",
    title: "Snapshot-Safe Versioning",
    description:
      "Every save captures a frozen version snapshot. You can freely edit questions without ever corrupting older answers.",
  },
  {
    icon: Link2,
    num: "03",
    title: "Instant Public Sharing",
    description:
      "Publish in one click with a clean, short 16-character link that renders effortlessly on mobile, tablet, and desktop.",
  },
  {
    icon: ShieldCheck,
    num: "04",
    title: "Strict Response Integrity",
    description:
      "Answers are permanently locked to the exact version snapshot respondents saw, backed by a relational PostgreSQL database.",
  },
] as const;

export function LandingPhilosophy() {
  return (
    <div className="relative w-full border-b border-border/80 bg-muted/10">
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* 4 Architectural Pillars Grid with hairlines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/80">
        {PRINCIPLES.map((principle) => {
          const Icon = principle.icon;
          return (
            <div
              key={principle.title}
              className="group p-6 sm:p-7 flex flex-col justify-between hover:bg-muted/20 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="size-8 rounded border border-border/80 bg-background flex items-center justify-center text-foreground">
                    <Icon className="size-3.5" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {principle.num}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight mb-1.5">
                  {principle.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
