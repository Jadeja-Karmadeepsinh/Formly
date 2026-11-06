"use client";

import * as React from "react";
import {
  FileText,
  Terminal,
  History,
  ShieldCheck,
  BarChart3,
  Link2,
  Check,
  Copy,
  Radio,
  Star,
} from "lucide-react";

import { SectionHeader, Kbd, Crosshair } from "./frame";
import { Badge } from "~/components/ui/badge";

export function LandingFeatures() {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div id="features" className="relative w-full">
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* Section Header */}
      <div className="px-4 sm:px-8 py-12 sm:py-16 border-b border-border/80 bg-background">
        <SectionHeader
          index="01"
          eyebrow="Core Architecture"
          title="Everything you need to collect better answers."
          description="Engineered as a document engine, not a widget puzzle. Formly gives you speed in creation and absolute integrity in data."
        />
      </div>

      {/* Lined Bento Grid: 3 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 divide-border/80 md:[&>*]:border-b md:[&>*]:border-border/80 lg:[&>*:nth-child(3n)]:border-r-0 md:[&>*:not(:nth-child(2n))]:border-r lg:[&>*:not(:nth-child(3n))]:border-r">
        {/* Cell 1: Document-First Editing */}
        <div className="group relative p-6 sm:p-8 flex flex-col justify-between hover:bg-muted/15 transition-colors">
          <div>
            <div className="size-9 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground mb-4">
              <FileText className="size-4" />
            </div>
            <div className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Typing Experience
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Document-First Editing
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Build questions naturally. Type headlines, questions, and descriptions inline on a continuous canvas without wrestling with sidebar dialogs.
            </p>
          </div>

          {/* Mini Visual Demo */}
          <div className="mt-6 rounded-md border border-border/80 bg-card p-3 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground/40" />
              <span>Inline block editing</span>
            </div>
            <div className="rounded border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs text-foreground font-medium flex items-center justify-between">
              <span>What is your primary goal?</span>
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[11px] text-muted-foreground pl-1">
              Press Enter for next question
            </div>
          </div>
        </div>

        {/* Cell 2: Slash Command Palette */}
        <div className="group relative p-6 sm:p-8 flex flex-col justify-between hover:bg-muted/15 transition-colors">
          <div>
            <div className="size-9 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground mb-4">
              <Terminal className="size-4" />
            </div>
            <div className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Keyboard Velocity
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Slash Command Blocks
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Keep your hands on the keyboard. Press <Kbd>/</Kbd> anywhere to summon 18+ question types, ratings, choice groups, and date pickers.
            </p>
          </div>

          {/* Mini Visual Demo */}
          <div className="mt-6 rounded-md border border-border/80 bg-card p-3 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground border-b border-border/60 pb-1.5">
              <span className="font-semibold text-foreground">/</span>
              <span>Select Block Type</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between rounded bg-muted/70 px-2 py-1 text-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <Star className="size-3 text-muted-foreground" />
                  Rating Scale (1-10)
                </span>
                <Kbd className="text-[9px] py-0 px-1">↵</Kbd>
              </div>
              <div className="flex items-center justify-between px-2 py-1 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Radio className="size-3" />
                  Multiple Choice
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cell 3: Snapshot Versioning */}
        <div className="group relative p-6 sm:p-8 flex flex-col justify-between hover:bg-muted/15 transition-colors">
          <div>
            <div className="size-9 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground mb-4">
              <History className="size-4" />
            </div>
            <div className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Data Safety
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Immutable Version Snapshots
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every publish freezes a permanent schema snapshot. Work freely on drafts without worrying about breaking currently open respondent sessions.
            </p>
          </div>

          {/* Mini Visual Demo */}
          <div className="mt-6 rounded-md border border-border/80 bg-card p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Version History</span>
              <span className="font-mono text-[10px] text-muted-foreground">3 snapshots</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between rounded border border-border/60 bg-muted/20 px-2 py-1">
                <span className="flex items-center gap-1.5 text-foreground font-mono text-[11px]">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  v2 (Current Live)
                </span>
                <span className="text-[10px] text-muted-foreground">Published</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 text-muted-foreground">
                <span className="font-mono text-[11px]">v1 (Archived)</span>
                <span className="text-[10px]">94 responses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cell 4: Response Record Inspector */}
        <div className="group relative p-6 sm:p-8 flex flex-col justify-between hover:bg-muted/15 transition-colors">
          <div>
            <div className="size-9 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground mb-4">
              <ShieldCheck className="size-4" />
            </div>
            <div className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Record Integrity
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Strict Response Integrity
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Responses are cryptographically linked to the exact question snapshot the user saw. No orphaned fields or schema misalignment over time.
            </p>
          </div>

          {/* Mini Visual Demo */}
          <div className="mt-6 rounded-md border border-border/80 bg-card p-3 shadow-2xs space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-1">
              <span>RECORD_ID</span>
              <span className="text-emerald-600 dark:text-emerald-400">VERIFIED</span>
            </div>
            <div className="text-foreground text-[10px] truncate">
              sub_8f29c41d9a2b · schema_v2
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Check className="size-3 text-emerald-500" />
              <span>Full cryptographic schema integrity</span>
            </div>
          </div>
        </div>

        {/* Cell 5: Real-time Analytics */}
        <div className="group relative p-6 sm:p-8 flex flex-col justify-between hover:bg-muted/15 transition-colors">
          <div>
            <div className="size-9 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground mb-4">
              <BarChart3 className="size-4" />
            </div>
            <div className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Performance Insights
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Integrated Analytics
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Understand conversion at a glance. Track completion rates, drop-off points, submission volume trends, and device breakdowns instantly.
            </p>
          </div>

          {/* Mini Visual Demo */}
          <div className="mt-6 rounded-md border border-border/80 bg-card p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono text-[11px]">COMPLETION</span>
              <span className="font-semibold text-foreground">94.2%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-foreground rounded-full w-[94.2%]" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>Avg time: 1m 12s</span>
              <span>248 submissions</span>
            </div>
          </div>
        </div>

        {/* Cell 6: Instant Sharing */}
        <div className="group relative p-6 sm:p-8 flex flex-col justify-between hover:bg-muted/15 transition-colors">
          <div>
            <div className="size-9 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground mb-4">
              <Link2 className="size-4" />
            </div>
            <div className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Distribution
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Instant Public Sharing
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              One click delivers a fast, responsive public form link. Respondents get a distraction-free questionnaire designed to finish.
            </p>
          </div>

          {/* Mini Visual Demo */}
          <div className="mt-6 rounded-md border border-border/80 bg-card p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-muted-foreground">SHARE URL</span>
              <Badge variant="outline" className="text-[9px] font-mono py-0 h-4">
                Public
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs">
              <span className="font-mono text-[11px] text-foreground truncate max-w-[160px]">
                formly.app/f/k7a9vL2m
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-muted-foreground hover:text-foreground"
              >
                {copiedLink ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
