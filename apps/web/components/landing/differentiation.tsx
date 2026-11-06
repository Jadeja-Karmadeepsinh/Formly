import * as React from "react";
import { SectionHeader, Crosshair } from "./frame";
import { Check, Minus } from "lucide-react";

const COMPARISON_ROWS = [
  {
    feature: "Editor Paradigm",
    formly: "Continuous document-first canvas with inline typing",
    traditional: "Rigid drag-and-drop trees with nested modal drawers",
    formlyAdvantage: true,
  },
  {
    feature: "Version Control",
    formly: "Immutable snapshot freezing on each publish",
    traditional: "Live edits silently overwrite active schemas",
    formlyAdvantage: true,
  },
  {
    feature: "Question Insertion",
    formly: "Keyboard slash command (/) with instant block picker",
    traditional: "Manual drag from heavy fixed sidebars",
    formlyAdvantage: true,
  },
  {
    feature: "Respondent Runtime",
    formly: "Lightweight, privacy-first, sub-100ms load time",
    traditional: "Heavy scripts, third-party cookies, intrusive loaders",
    formlyAdvantage: true,
  },
  {
    feature: "Data Integrity",
    formly: "Submissions cryptographically pinned to form version",
    traditional: "Historic answers risk orphan states on schema change",
    formlyAdvantage: true,
  },
  {
    feature: "Dark & Light Mode",
    formly: "Native theme support designed into every component",
    traditional: "Light theme only or requires custom CSS overrides",
    formlyAdvantage: true,
  },
];

export function LandingDifferentiation() {
  return (
    <div id="comparison" className="relative w-full">
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* Section Header */}
      <div className="px-4 sm:px-8 py-12 sm:py-16 border-b border-border/80 bg-background">
        <SectionHeader
          index="05"
          eyebrow="Architectural Comparison"
          title="Why document-first architecture matters."
          description="A direct, factual comparison between Formly's snapshot document engine and traditional form builders."
        />
      </div>

      {/* Clean Lined Comparison Table */}
      <div className="w-full overflow-x-auto border-b border-border/80">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-border/80 bg-muted/20 font-mono text-[11px] text-muted-foreground uppercase">
              <th className="py-3.5 px-6 font-semibold w-1/3">CAPABILITY</th>
              <th className="py-3.5 px-6 font-semibold w-1/3 text-foreground bg-muted/30 border-x border-border/80">
                FORMLY
              </th>
              <th className="py-3.5 px-6 font-semibold w-1/3">TRADITIONAL BUILDERS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80 text-xs sm:text-sm">
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={i} className="hover:bg-muted/15 transition-colors">
                <td className="py-4 px-6 font-medium text-foreground">
                  {row.feature}
                </td>
                <td className="py-4 px-6 text-foreground bg-muted/10 border-x border-border/80 font-medium">
                  <div className="flex items-start gap-2.5">
                    <div className="size-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    <span>{row.formly}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <div className="size-4 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                      <Minus className="size-2.5" />
                    </div>
                    <span>{row.traditional}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
