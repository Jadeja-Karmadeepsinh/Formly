"use client";

import * as React from "react";
import {
  CheckCircle2,
  RotateCcw,
  Send,
} from "lucide-react";

import { SectionHeader, Crosshair, Kbd } from "./frame";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export function LandingProductShowcase() {

  return (
    <div id="builder-deep-dive" className="relative w-full">
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* Section Header */}
      <div className="px-4 sm:px-8 py-12 sm:py-16 border-b border-border/80 bg-background">
        <SectionHeader
          index="02"
          eyebrow="Workflow Deep-Dive"
          title="Engineered for how serious builders work."
          description="A look under the hood at the editing experience, version control, and respondent runtime that make Formly reliable."
        />
      </div>

      {/* Row 1: Document Editor & Slash Commands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/80 border-b border-border/80">
        {/* Left: Narrative */}
        <div className="p-6 sm:p-12 flex flex-col justify-center space-y-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            01. Inline Document Canvas
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Write forms like docs, not configuration trees.
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Most form builders force you into modal drawers, rigid drag-and-drop trees, and slow preview cycles. In Formly, your form is a living document.
          </p>
          <ul className="space-y-2 pt-2 text-xs sm:text-sm text-foreground/90 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Full keyboard navigation: <Kbd>/</Kbd> for blocks, <Kbd>Tab</Kbd> to navigate</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Inline descriptions, placeholders, and validation on each block</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Real-time local state caching prevents accidental work loss</span>
            </li>
          </ul>
        </div>

        {/* Right: Visual Demonstration */}
        <div className="p-6 sm:p-10 bg-muted/10 flex items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-border/80 bg-card panel-highlight p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs">
              <span className="font-mono text-muted-foreground">SLASH_COMMAND_MENU</span>
              <Badge variant="outline" className="text-[10px] font-mono h-4">
                Active
              </Badge>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="text-muted-foreground">What is your favorite developer framework?</div>
              <div className="rounded border border-foreground/30 bg-muted/30 px-3 py-2 text-foreground font-semibold flex items-center gap-2">
                <span className="text-foreground">/</span>
                <span>rating-scale</span>
                <span className="ml-auto font-sans font-normal text-[10px] text-muted-foreground">Press Enter</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="rounded border border-border/80 bg-background p-1 space-y-0.5 text-xs">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-foreground text-background font-medium">
                <span>Rating Scale (1–10)</span>
                <Kbd className="bg-background text-foreground text-[9px]">1</Kbd>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-muted-foreground hover:bg-muted/40">
                <span>Multiple Choice</span>
                <Kbd className="text-[9px]">2</Kbd>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-muted-foreground hover:bg-muted/40">
                <span>Short Answer</span>
                <Kbd className="text-[9px]">3</Kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Immutable Version Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/80 border-b border-border/80">
        {/* Left: Visual Demonstration (Reversed for rhythm) */}
        <div className="p-6 sm:p-10 bg-muted/10 flex items-center justify-center order-2 lg:order-1">
          <div className="w-full max-w-md rounded-lg border border-border/80 bg-card panel-highlight p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs">
              <span className="font-mono text-muted-foreground">VERSION_TIMELINE</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                ● Live sync active
              </span>
            </div>

            <div className="space-y-3">
              {/* Version 3 (Draft) */}
              <div className="rounded border border-dashed border-border/80 bg-muted/20 p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Version 3 (Draft)</span>
                  <Badge variant="outline" className="text-[9px] font-mono h-4">
                    Unpublished
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Added 2 new conditional rating blocks · Modified question labels
                </p>
              </div>

              {/* Version 2 (Published) */}
              <div className="rounded border border-border/80 bg-background p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Version 2 (Published)
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Active for respondents
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
                  <span>Captured 184 responses</span>
                  <span className="text-[10px] font-mono">Yesterday at 14:32</span>
                </div>
              </div>

              {/* Version 1 (Archived) */}
              <div className="rounded border border-border/60 bg-muted/10 p-3 space-y-1 opacity-70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Version 1 (Initial Release)</span>
                  <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] font-mono gap-1">
                    <RotateCcw className="size-2.5" />
                    Inspect
                  </Button>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Archived · 64 historic responses preserved
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Narrative */}
        <div className="p-6 sm:p-12 flex flex-col justify-center space-y-4 order-1 lg:order-2">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            02. Version Control
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Edit freely without breaking live forms.
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            In typical form software, editing a question can silently corrupt existing response records or disrupt respondents midway through submitting. Formly solves this with immutable snapshot versioning.
          </p>
          <ul className="space-y-2 pt-2 text-xs sm:text-sm text-foreground/90 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Drafts stay private until you explicitly hit Publish</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Submissions are locked to the exact version seen by the respondent</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Full audit history: inspect and restore past schemas anytime</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Row 3: Clean Respondent Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/80 border-b border-border/80">
        {/* Left: Narrative */}
        <div className="p-6 sm:p-12 flex flex-col justify-center space-y-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            03. Respondent Experience
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Clean, fast forms that people actually finish.
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            The respondent experience is the front door of your product. Formly generates lean, accessible, keyboard-friendly forms that load instantly on desktop and mobile.
          </p>
          <ul className="space-y-2 pt-2 text-xs sm:text-sm text-foreground/90 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Full keyboard hotkeys: press 1–5 or A–C for choices</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Zero third-party trackers, popups, or bloated scripts</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Automatic progress saving prevents lost mobile submissions</span>
            </li>
          </ul>
        </div>

        {/* Right: Visual Demonstration */}
        <div className="p-6 sm:p-10 bg-muted/10 flex items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-border/80 bg-card panel-highlight p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs">
              <span className="font-mono text-muted-foreground">RESPONDENT_VIEWPORT</span>
              <span className="font-mono text-[10px] text-muted-foreground">Progress: 66%</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-muted-foreground">QUESTION 02 OF 03</span>
                <div className="text-sm font-semibold text-foreground">
                  Which feature should our engineering team prioritize next?
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded border border-foreground/30 bg-muted/30 px-3 py-2 text-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <Kbd>A</Kbd>
                    <span>Advanced response filtering & export</span>
                  </div>
                  <CheckCircle2 className="size-3.5 text-foreground" />
                </div>
                <div className="flex items-center justify-between rounded border border-border/80 bg-background px-3 py-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Kbd>B</Kbd>
                    <span>Custom domain & branded styling</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded border border-border/80 bg-background px-3 py-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Kbd>C</Kbd>
                    <span>Webhook integration triggers</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] font-mono text-muted-foreground border-t border-border/60">
                <span>Press Enter to proceed</span>
                <Send className="size-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
