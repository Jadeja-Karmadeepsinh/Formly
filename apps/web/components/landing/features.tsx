"use client";

import * as React from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Lock,
  Radio,
  Sliders,
  Star,
  TabletSmartphone,
  Type,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export function LandingFeatures() {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopy = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="features" className="py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-20 sm:space-y-28 lg:space-y-36">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Core Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Designed for flow. Engineered for precision.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
            Every feature in Formly is crafted to make creating, distributing, and analyzing forms feel direct and distraction-free.
          </p>
        </div>

        {/* ======================================================== */}
        {/* FEATURE 1: CREATE WITHOUT FRICTION                        */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5 space-y-4">
            <Badge variant="outline" className="text-xs font-normal">
              Document Workflow
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Create without friction.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No complex drag-and-drop sidebars or multi-level menus. Type questions directly inside a clean document canvas. Press{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground font-medium">
                /
              </kbd>{" "}
              anywhere to insert questions, choices, or explanatory text blocks instantly.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>18 distinct question and content element types</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>Instant slash-command insertion and inline label editing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>Natural document flow with headings, dividers, and notes</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            {/* Visual: Slash Command Palette in Document */}
            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-foreground" />
                    <span className="text-xs font-medium text-foreground">Annual Design Survey</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Editing draft</span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs font-medium text-foreground mb-1">
                      1. How satisfied are you with our current toolstack?
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <div
                          key={val}
                          className="size-7 rounded border border-border bg-background text-[11px] font-semibold flex items-center justify-center text-muted-foreground"
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active slash command popover menu */}
                  <div className="rounded-lg border border-border bg-popover p-1.5 shadow-lg max-w-sm">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Slash Command Elements
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center justify-between rounded-md bg-muted px-2.5 py-1.5 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Radio className="size-3.5" />
                          <span>Multiple Choice</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">/choice</span>
                      </div>
                      <div className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/40">
                        <div className="flex items-center gap-2">
                          <Type className="size-3.5" />
                          <span>Short Text</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">/text</span>
                      </div>
                      <div className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/40">
                        <div className="flex items-center gap-2">
                          <Star className="size-3.5" />
                          <span>Linear Rating Scale</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">/rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FEATURE 2: MAKE EVERY FORM FEEL YOURS                     */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 order-2 lg:order-1">
            {/* Visual: Form Settings & Styling Controls */}
            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="size-4 text-foreground" />
                    <span className="text-xs font-semibold text-foreground">Form Configuration & Behavior</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Live Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                    <span className="font-medium text-foreground">Submit Button Label</span>
                    <div className="rounded border border-border bg-background px-2.5 py-1.5 text-muted-foreground font-mono">
                      Send Application →
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                    <span className="font-medium text-foreground">Completion Progress Bar</span>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground">Show progress indicator</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        Enabled
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5 sm:col-span-2">
                    <span className="font-medium text-foreground">Custom Post-Submission Redirect</span>
                    <div className="rounded border border-border bg-background px-2.5 py-1.5 text-muted-foreground font-mono text-[11px] truncate">
                      https://company.com/welcome-onboarding
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-background/50 p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">Multiple Submissions</p>
                    <p className="text-[11px] text-muted-foreground">Allow respondents to submit more than once</p>
                  </div>
                  <div className="size-5 rounded-full bg-foreground flex items-center justify-center text-background text-[10px]">
                    ✓
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <Badge variant="outline" className="text-xs font-normal">
              Tailored Experience
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Make every form feel yours.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customize submit button labels, progress bars, redirect URLs, and validation rules without touching code. Formly adapts cleanly to your brand&apos;s tone of voice and requirements.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>Custom submit text & thank-you confirmation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>Automatic dark and light theme responsiveness</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>Custom redirect URLs for frictionless onboarding</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FEATURE 3: SHARE WITH EASE                                */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5 space-y-4">
            <Badge variant="outline" className="text-xs font-normal">
              Distribution
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Share with ease.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Publishing is instant. Every form receives a cryptographically secure 16-character share link that works on any browser without requiring respondent accounts.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>Instant single-click publishing & unpublishing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>Public and unlisted privacy controls</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground shrink-0" />
                <span>Zero account requirements for respondents</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            {/* Visual: Publishing Card */}
            <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-7 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">Form is Live & Published</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Version 3
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">Shareable Public URL</span>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                  <Globe className="size-4 text-muted-foreground shrink-0 ml-1" />
                  <input
                    readOnly
                    value="https://formly.app/f/K7a_9vL2mX4pQ0wR"
                    className="flex-1 bg-transparent text-xs font-mono text-foreground focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopy}
                    className="h-7 px-3 text-xs gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    <span>{copiedLink ? "Copied" : "Copy link"}</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="size-3.5 text-foreground" />
                  <span>Visibility status:</span>
                  <span className="font-medium text-foreground">Unlisted (Anyone with link)</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Submissions: <span className="font-semibold text-foreground">Unlimited</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FEATURE 4 & 5: RESPONSE MANAGEMENT & ANALYTICS           */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          {/* Feature 4: Tabular Submissions */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="text-xs font-normal">
                Submissions
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Keep responses organized.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Review incoming responses in a clean, spreadsheet-style table. Every answer is neatly categorized by question and submission timestamp.
              </p>
            </div>

            {/* Illustrative Submissions Table */}
            <div className="rounded-lg border border-border/70 overflow-hidden bg-background">
              <div className="border-b border-border/60 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground grid grid-cols-12 gap-2">
                <span className="col-span-3">Timestamp</span>
                <span className="col-span-4">Role / Team</span>
                <span className="col-span-3">Frequency</span>
                <span className="col-span-2 text-right">Rating</span>
              </div>
              <div className="divide-y divide-border/40 text-xs font-mono">
                <div className="px-3 py-2 grid grid-cols-12 gap-2 items-center text-muted-foreground">
                  <span className="col-span-3 text-[11px]">Today, 10:24</span>
                  <span className="col-span-4 text-foreground font-sans truncate">VP Product</span>
                  <span className="col-span-3 text-[11px] font-sans">Daily</span>
                  <span className="col-span-2 text-right font-semibold text-foreground">5 / 5</span>
                </div>
                <div className="px-3 py-2 grid grid-cols-12 gap-2 items-center text-muted-foreground">
                  <span className="col-span-3 text-[11px]">Yesterday</span>
                  <span className="col-span-4 text-foreground font-sans truncate">Design Lead</span>
                  <span className="col-span-3 text-[11px] font-sans">Weekly</span>
                  <span className="col-span-2 text-right font-semibold text-foreground">5 / 5</span>
                </div>
                <div className="px-3 py-2 grid grid-cols-12 gap-2 items-center text-muted-foreground">
                  <span className="col-span-3 text-[11px]">2 days ago</span>
                  <span className="col-span-4 text-foreground font-sans truncate">Staff Engineer</span>
                  <span className="col-span-3 text-[11px] font-sans">Monthly</span>
                  <span className="col-span-2 text-right font-semibold text-foreground">4 / 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Submission Insights */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="text-xs font-normal">
                Insights
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Understand your responses.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track real submission activity, completion velocity, and device distribution without configuring third-party analytics trackers.
              </p>
            </div>

            {/* Illustrative Analytics Cards */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block mb-0.5">Total Responses</span>
                  <span className="text-xl font-bold text-foreground">248</span>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block mb-0.5">Completion Rate</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                  <span className="text-[11px] text-muted-foreground block mb-0.5">Avg. Time</span>
                  <span className="text-xl font-bold text-foreground">1m 12s</span>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-background p-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TabletSmartphone className="size-4 text-foreground" />
                  <span>Respondent Device Breakdown</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span>Desktop: 64%</span>
                  <span>Mobile: 36%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
