"use client";

import * as React from "react";
import {
  Clock,
  Eye,
  FileEdit,
  FileSpreadsheet,
  History,
  RotateCcw,
} from "lucide-react";

import { Button } from "~/components/ui/button";

type ShowcaseTab = "editor" | "history" | "submissions" | "preview";

export function LandingProductShowcase() {
  const [activeTab, setActiveTab] = React.useState<ShowcaseTab>("editor");

  return (
    <section id="showcase" className="border-t border-border/50 bg-muted/20 py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Product Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            A cohesive studio for every stage of a form.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
            Formly brings together editing, snapshot-based versioning, respondent delivery, and tabular response management into one unified workspace.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-border/80 bg-background/90 p-1 shadow-xs">
            {[
              { id: "editor" as const, label: "Document Editor", icon: FileEdit },
              { id: "history" as const, label: "Version History", icon: History },
              { id: "submissions" as const, label: "Submissions Table", icon: FileSpreadsheet },
              { id: "preview" as const, label: "Respondent View", icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Showcase Canvas Frame */}
        <div className="rounded-xl border border-border/80 bg-card shadow-xl overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-foreground">Formly Studio</span>
              <span className="text-muted-foreground/60">/</span>
              <span className="text-muted-foreground">Product Feedback Form</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span>status: active</span>
            </div>
          </div>

          {/* Active Tab View Body */}
          <div className="p-6 sm:p-10 min-h-[420px] flex items-center justify-center">
            {activeTab === "editor" && (
              <div className="w-full max-w-2xl space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border/40 pb-4 space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">Product Feedback Survey</h3>
                  <p className="text-sm text-muted-foreground">
                    Type your form questions directly into the document canvas.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-1.5">
                    <span className="text-xs font-mono text-muted-foreground">Question 01</span>
                    <p className="text-sm font-medium text-foreground">What features do you value most in Formly?</p>
                    <div className="rounded border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                      Long text answer field...
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-1.5">
                    <span className="text-xs font-mono text-muted-foreground">Question 02</span>
                    <p className="text-sm font-medium text-foreground">Rate your overall satisfaction (1 to 10)</p>
                    <div className="flex gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <div
                          key={n}
                          className="flex-1 text-center py-2 rounded border border-border bg-background text-xs font-semibold text-muted-foreground"
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="w-full max-w-xl space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1 border-b border-border/40 pb-3">
                  <h3 className="text-lg font-bold text-foreground">Version History & Snapshots</h3>
                  <p className="text-xs text-muted-foreground">
                    Restoring an older version creates Version N+1 without mutating past records.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <div className="rounded-lg border border-foreground/30 bg-muted/30 p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="size-4 text-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">Version 3 (Current)</span>
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            Published
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">Saved 12 minutes ago · 4 questions</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">active</span>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-background p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="size-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-foreground">Version 2</span>
                        <p className="text-[11px] text-muted-foreground">Saved yesterday · 3 questions</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                      <RotateCcw className="size-3" />
                      Restore
                    </Button>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-background p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="size-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-foreground">Version 1 (Initial Draft)</span>
                        <p className="text-[11px] text-muted-foreground">Saved 3 days ago · 2 questions</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                      <RotateCcw className="size-3" />
                      Restore
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="w-full max-w-3xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Response Submissions</h3>
                    <p className="text-xs text-muted-foreground">124 total verified responses</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Export CSV
                  </Button>
                </div>

                <div className="rounded-lg border border-border/70 overflow-hidden bg-background">
                  <div className="grid grid-cols-12 gap-2 border-b border-border/60 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                    <span className="col-span-3">Submitted At</span>
                    <span className="col-span-4">Valued Features</span>
                    <span className="col-span-3">Satisfaction</span>
                    <span className="col-span-2 text-right">Device</span>
                  </div>
                  <div className="divide-y divide-border/40 text-xs">
                    <div className="grid grid-cols-12 gap-2 items-center px-3 py-2 text-muted-foreground">
                      <span className="col-span-3 font-mono text-[11px]">Today, 14:15</span>
                      <span className="col-span-4 text-foreground truncate">Slash commands & speed</span>
                      <span className="col-span-3 font-semibold text-foreground">10 / 10</span>
                      <span className="col-span-2 text-right text-[11px]">macOS / Chrome</span>
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center px-3 py-2 text-muted-foreground">
                      <span className="col-span-3 font-mono text-[11px]">Today, 11:30</span>
                      <span className="col-span-4 text-foreground truncate">Clean mobile responsive view</span>
                      <span className="col-span-3 font-semibold text-foreground">9 / 10</span>
                      <span className="col-span-2 text-right text-[11px]">iOS / Safari</span>
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center px-3 py-2 text-muted-foreground">
                      <span className="col-span-3 font-mono text-[11px]">Yesterday, 09:40</span>
                      <span className="col-span-4 text-foreground truncate">Version restore safety</span>
                      <span className="col-span-3 font-semibold text-foreground">10 / 10</span>
                      <span className="col-span-2 text-right text-[11px]">Windows / Edge</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="w-full max-w-lg space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1 border-b border-border/40 pb-3">
                  <span className="text-[11px] font-mono text-muted-foreground">Respondent Runner</span>
                  <h3 className="text-xl font-bold text-foreground">Product Feedback Survey</h3>
                  <p className="text-xs text-muted-foreground">A clean, distraction-free answering experience.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      1. What features do you value most?
                    </label>
                    <textarea
                      readOnly
                      rows={2}
                      value="The document-first editor makes creating questions as fast as writing notes."
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground resize-none focus:outline-none"
                    />
                  </div>
                  <Button className="w-full h-9 text-xs">Submit Response</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
