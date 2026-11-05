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
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export function HeroInteractivePreview() {
  const [viewMode, setViewMode] = React.useState<"editor" | "respondent">("editor");

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
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xs overflow-hidden transition-all duration-300">
      {/* Top Application Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/70 bg-muted/30 px-3.5 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          {/* Window dots */}
          <div className="hidden sm:flex items-center gap-1.5 pr-2">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="font-semibold text-foreground">Customer Experience Survey</span>
            <span className="text-muted-foreground/60 hidden sm:inline">/</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground hidden sm:inline">
              formly.app/f/k7a9vL2m
            </span>
          </div>
        </div>

        {/* Mode Switcher & Controls */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border/80 bg-background/80 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "editor"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileEdit className="size-3.5" />
              <span>Document Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("respondent")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "respondent"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="size-3.5" />
              <span>Live Form</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy public link"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copiedLink ? "Copied" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="min-h-[460px] p-5 sm:p-8 md:p-12">
        {viewMode === "editor" ? (
          /* ======================================================== */
          /* 1. DOCUMENT-BASED FORM BUILDER VIEW                       */
          /* ======================================================== */
          <div className="mx-auto max-w-2xl space-y-7 animate-in fade-in duration-200">
            {/* Form Title & Description Header */}
            <div className="group relative space-y-2 border-b border-border/40 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Document Canvas
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Published · Version 2
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Customer Feedback & Experience
              </h3>
              <p className="text-sm text-muted-foreground">
                Tell us about your recent experience so our product team can tailor the workflow to your needs.
              </p>
            </div>

            {/* Question 1: Short Text Block */}
            <div className="group relative rounded-lg border border-transparent p-3 sm:p-4 transition-all hover:border-border/60 hover:bg-muted/15">
              <div className="absolute -left-3 top-4 hidden group-hover:flex items-center gap-1 text-muted-foreground/60 sm:-left-7">
                <GripVertical className="size-4" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">01</span>
                  <label className="text-sm font-semibold text-foreground">
                    What is your organization or role?
                  </label>
                  <span className="text-destructive text-xs" title="Required">
                    *
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                  <Type className="size-2.5 mr-1" />
                  Short text
                </Badge>
              </div>
              <div className="rounded-md border border-border/80 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                e.g. Head of Product, Stripe
              </div>
            </div>

            {/* Question 2: Multiple Choice Pills */}
            <div className="group relative rounded-lg border border-border/40 bg-muted/10 p-3 sm:p-4 transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">02</span>
                  <label className="text-sm font-semibold text-foreground">
                    How frequently do you publish new forms?
                  </label>
                </div>
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                  <Radio className="size-2.5 mr-1" />
                  Single choice
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {["Every day", "Once or twice a week", "A few times a month"].map((option, i) => (
                  <div
                    key={option}
                    className={`rounded-md border p-2.5 text-xs transition-colors cursor-pointer ${
                      i === 1
                        ? "border-foreground bg-foreground/5 font-medium text-foreground"
                        : "border-border/80 bg-background/60 text-muted-foreground hover:border-foreground/40"
                    }`}
                  >
                    <span className="font-mono text-[10px] mr-1.5 opacity-60">[{String.fromCharCode(65 + i)}]</span>
                    {option}
                  </div>
                ))}
              </div>
            </div>

            {/* Inline Slash Command Prompt & Popover Simulation */}
            <div className="relative pt-2">
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border/80 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                <Plus className="size-3.5 text-muted-foreground/70" />
                <span>Type</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground font-semibold">
                  /
                </kbd>
                <span>to insert a question or content block...</span>
              </div>

              {/* Popover Card */}
              <div className="mt-2 rounded-xl border border-border bg-popover p-1.5 shadow-lg w-full max-w-xs text-popover-foreground">
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Insert Element
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2.5 rounded-md bg-muted px-2 py-1.5 font-medium text-foreground">
                    <Star className="size-3.5" />
                    <div className="flex flex-col">
                      <span>Rating Scale</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Score 1 to 5 or 1 to 10
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                    <ChevronDown className="size-3.5" />
                    <span>Dropdown Select</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                    <Type className="size-3.5" />
                    <span>Paragraph Text</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 2. LIVE RESPONDENT EXPERIENCE VIEW                        */
          /* ======================================================== */
          <div className="mx-auto max-w-xl space-y-6 animate-in fade-in duration-200">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Check className="size-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-bold tracking-tight text-foreground">
                    Thank you for your feedback!
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Your response has been recorded directly into the project&apos;s tabular submissions workspace.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetResponse}
                  className="mt-2 text-xs"
                >
                  Fill out another response
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 border-b border-border/40 pb-4">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Customer Feedback & Experience
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Please take a moment to answer these three questions. All inputs are live and interactive!
                  </p>
                </div>

                {/* Input 1 */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5">
                    <span>1. What is your role or organization?</span>
                    <span className="text-destructive text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
                  />
                </div>

                {/* Input 2 */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">
                    2. How often do you publish new forms?
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { id: "daily", label: "Every day" },
                      { id: "weekly", label: "Every week" },
                      { id: "monthly", label: "Monthly" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFrequency(item.id)}
                        className={`rounded-md border p-2.5 text-xs text-left transition-all ${
                          frequency === item.id
                            ? "border-foreground bg-foreground text-background font-medium shadow-xs"
                            : "border-border/80 bg-background text-foreground hover:bg-muted/40"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input 3 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-medium text-foreground">
                      3. Rate your document form-building experience
                    </label>
                    <span className="text-xs font-medium text-muted-foreground">
                      {rating !== null ? `${rating} / 5` : "Select"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`flex-1 rounded-md border py-2.5 text-xs font-semibold transition-all ${
                          rating === star
                            ? "border-foreground bg-foreground text-background shadow-xs"
                            : "border-border/80 bg-background text-foreground hover:bg-muted/40"
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground px-0.5">
                    <span>1 (Clunky)</span>
                    <span>5 (Effortless)</span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    onClick={() => setIsSubmitted(true)}
                    className="w-full sm:w-auto px-6 h-10 text-xs font-medium gap-1.5"
                  >
                    Submit response
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Subtle Bottom Status Bar */}
      <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>Real-time Formly document engine simulation</span>
        </div>
        <span className="hidden sm:inline">Zero page refreshes · Keyboard accessible</span>
      </div>
    </div>
  );
}
