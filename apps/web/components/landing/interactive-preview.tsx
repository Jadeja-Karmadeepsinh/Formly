"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  FileEdit,
  GripVertical,
  Plus,
  Radio,
  Star,
  Type,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Kbd } from "./frame";

export function HeroInteractivePreview() {
  const [activeTab, setActiveTab] = React.useState<"editor" | "respondent" | "responses">("editor");

  // Interactive respondent state
  const [nameInput, setNameInput] = React.useState("");
  const [frequency, setFrequency] = React.useState("weekly");
  const [rating, setRating] = React.useState<number | null>(5);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleResetResponse = () => {
    setIsSubmitted(false);
    setNameInput("");
    setFrequency("weekly");
    setRating(5);
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Subtle radial backdrop glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-foreground/[0.03] blur-2xl"
      />

      {/* Main Framed Window */}
      <div className="relative rounded-lg border border-border/80 bg-card panel-highlight overflow-hidden shadow-xl">
        {/* Title Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/80 bg-muted/30 px-3.5 py-2 sm:px-4">
          <div className="flex items-center gap-3">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full border border-border/60 bg-muted-foreground/20" />
              <span className="size-2.5 rounded-full border border-border/60 bg-muted-foreground/20" />
              <span className="size-2.5 rounded-full border border-border/60 bg-muted-foreground/20" />
            </div>

            {/* Document Breadcrumb & Share ID */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-foreground">
                Customer Onboarding Survey
              </span>
              <span className="text-muted-foreground/40 hidden sm:inline">/</span>
              <span className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hidden sm:inline">
                formly.app/f/k7a9vL2m
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                v2 published
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border/80 bg-background/90 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeTab === "editor"
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileEdit className="size-3" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("respondent")}
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeTab === "respondent"
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="size-3" />
                <span>Live Form</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("responses")}
                className={`hidden sm:inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeTab === "responses"
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="size-3" />
                <span>Responses</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedLink ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
              <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Content View 1: Document Editor View */}
        {activeTab === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] min-h-[460px] divide-y lg:divide-y-0 lg:divide-x divide-border/80">
            {/* Left Rail: Block Outline */}
            <div className="hidden lg:flex flex-col bg-muted/10 p-3 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <span>Structure (03)</span>
                <Plus className="size-3 cursor-pointer hover:text-foreground" />
              </div>
              <div className="space-y-1 text-xs font-medium">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/60 text-foreground border border-border/60">
                  <Type className="size-3 text-muted-foreground" />
                  <span className="truncate">01. Full Name</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground cursor-pointer">
                  <Radio className="size-3 text-muted-foreground" />
                  <span className="truncate">02. Frequency</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground cursor-pointer">
                  <Star className="size-3 text-muted-foreground" />
                  <span className="truncate">03. Rating</span>
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-border/60">
                <div className="text-[10px] font-mono text-muted-foreground">
                  <div>Engine: Tiptap v3</div>
                  <div>Sync: Local + Cloud</div>
                </div>
              </div>
            </div>

            {/* Center Canvas: Document Editor */}
            <div className="p-5 sm:p-8 space-y-6 bg-background">
              {/* Document Header */}
              <div className="space-y-1.5 pb-3 border-b border-border/60">
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  Customer Onboarding Survey
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Please share your background so we can configure your workspace accurately.
                </p>
              </div>

              {/* Question Block 01 */}
              <div className="group relative rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-foreground/20">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <GripVertical className="size-3.5 opacity-40 group-hover:opacity-100 cursor-grab" />
                    <span className="font-semibold text-foreground">Q1</span>
                    <span>·</span>
                    <span>Short Text</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono py-0 h-4">
                    Required
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    What is your work email or company domain?
                  </div>
                  <div className="h-9 w-full rounded border border-border/80 bg-muted/20 px-3 flex items-center text-xs text-muted-foreground">
                    jane@acme-corp.com
                  </div>
                </div>
              </div>

              {/* Question Block 02 */}
              <div className="group relative rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-foreground/20">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <GripVertical className="size-3.5 opacity-40 group-hover:opacity-100 cursor-grab" />
                    <span className="font-semibold text-foreground">Q2</span>
                    <span>·</span>
                    <span>Single Choice</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    How frequently do you plan to collect responses?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 rounded border border-foreground/30 bg-muted/40 px-3 py-2 text-xs font-medium text-foreground">
                      <Kbd>A</Kbd>
                      <span>Every week</span>
                    </div>
                    <div className="flex items-center gap-2 rounded border border-border/80 bg-background px-3 py-2 text-xs text-muted-foreground">
                      <Kbd>B</Kbd>
                      <span>Monthly</span>
                    </div>
                    <div className="flex items-center gap-2 rounded border border-border/80 bg-background px-3 py-2 text-xs text-muted-foreground">
                      <Kbd>C</Kbd>
                      <span>Ad-hoc / Once</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slash Command Insertion Demo Bar */}
              <div className="relative rounded-md border border-dashed border-border/80 bg-muted/20 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono text-foreground font-semibold">/</span>
                  <span>Type <Kbd>/</Kbd> to insert rating, dropdown, or file upload...</span>
                </div>
                <span className="hidden sm:inline-flex text-[10px] font-mono text-muted-foreground">
                  18 block types
                </span>
              </div>
            </div>

            {/* Right Inspector Panel */}
            <div className="hidden lg:flex flex-col bg-muted/10 p-4 space-y-4 text-xs">
              <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                Block Inspector
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Question Type
                  </label>
                  <div className="rounded border border-border/80 bg-background px-2.5 py-1.5 font-medium text-foreground flex items-center justify-between">
                    <span>Short Text</span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Validation Rule
                  </label>
                  <div className="rounded border border-border/80 bg-background px-2.5 py-1.5 text-foreground flex items-center justify-between">
                    <span>Email format</span>
                    <CheckCircle2 className="size-3 text-emerald-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-[11px] font-medium text-foreground">Required field</span>
                  <div className="h-4 w-7 rounded-full bg-foreground p-0.5 flex items-center justify-end">
                    <span className="size-3 rounded-full bg-background" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Description</span>
                  <div className="h-4 w-7 rounded-full bg-muted p-0.5 flex items-center justify-start border border-border">
                    <span className="size-3 rounded-full bg-muted-foreground/40" />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-border/60 text-[11px] text-muted-foreground space-y-1">
                <div className="font-medium text-foreground">Immutable Snapshot</div>
                <p className="text-[10px] leading-relaxed">
                  Edits never alter live respondent submissions until published.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content View 2: Live Form (Respondent) View */}
        {activeTab === "respondent" && (
          <div className="p-6 sm:p-10 max-w-2xl mx-auto min-h-[460px] flex flex-col justify-center">
            {isSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="size-12 mx-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Check className="size-6" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">
                  Response Recorded Successfully
                </h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you! Your submission has been captured with strict cryptographic record integrity.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetResponse}
                  className="mt-2 text-xs"
                >
                  Submit another test response
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-foreground">
                    Customer Onboarding Survey
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try filling out this live form demo below.
                  </p>
                </div>

                {/* Field 1 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1">
                    What is your work email?
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Field 2 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    How frequently do you collect form responses?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "weekly", label: "Weekly" },
                      { id: "monthly", label: "Monthly" },
                      { id: "quarterly", label: "Quarterly" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFrequency(opt.id)}
                        className={`h-9 px-3 rounded-md border text-xs font-medium transition-all ${
                          frequency === opt.id
                            ? "border-foreground bg-foreground text-background font-semibold"
                            : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 3 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    How important is document-first editing to you?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        className={`size-9 rounded-md border text-xs font-medium transition-all ${
                          rating === val
                            ? "border-foreground bg-foreground text-background font-semibold"
                            : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setIsSubmitted(true)}
                  className="w-full h-10 text-sm font-medium"
                >
                  Submit Form
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Content View 3: Responses Table */}
        {activeTab === "responses" && (
          <div className="p-6 sm:p-8 min-h-[460px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <h4 className="text-base font-semibold text-foreground">
                  Submissions (248 records)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Snapshot: Version 2 · 94% completion rate
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="rounded border border-border/80 overflow-hidden text-xs">
              <div className="grid grid-cols-4 bg-muted/40 px-3 py-2 font-mono font-medium text-muted-foreground border-b border-border/80">
                <span>RESPONDENT</span>
                <span>FREQUENCY</span>
                <span>SCORE</span>
                <span>SUBMITTED AT</span>
              </div>
              {[
                { email: "alex@linear.app", freq: "Weekly", score: "5 / 5", time: "2 mins ago" },
                { email: "sarah@stripe.com", freq: "Monthly", score: "5 / 5", time: "18 mins ago" },
                { email: "david@vercel.com", freq: "Weekly", score: "4 / 5", time: "1 hour ago" },
                { email: "elena@figma.com", freq: "Quarterly", score: "5 / 5", time: "3 hours ago" },
                { email: "marcus@notion.so", freq: "Weekly", score: "5 / 5", time: "Yesterday" },
              ].map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 px-3 py-2.5 border-b border-border/60 last:border-0 items-center hover:bg-muted/20"
                >
                  <span className="font-medium text-foreground">{row.email}</span>
                  <span className="text-muted-foreground">{row.freq}</span>
                  <span className="font-mono text-foreground">{row.score}</span>
                  <span className="font-mono text-muted-foreground text-[11px]">{row.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Window Status Bar */}
        <div className="flex items-center justify-between border-t border-border/80 bg-muted/20 px-3.5 py-1.5 text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Interactive Formly Engine Simulation</span>
          </div>
          <span className="hidden sm:inline">Press Esc or click tabs to explore</span>
        </div>
      </div>
    </div>
  );
}
