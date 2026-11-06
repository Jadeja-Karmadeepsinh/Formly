"use client";

import * as React from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Globe,
  Monitor,
  Smartphone,
  Star,
  Tablet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useSubmission } from "~/hooks/api/form-submission";

interface ResponseDetailSheetProps {
  submissionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function ResponseDetailSheet({
  submissionId,
  open,
  onOpenChange,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
}: ResponseDetailSheetProps) {
  const [copiedId, setCopiedId] = React.useState(false);

  const { submission, isLoading } = useSubmission(submissionId ?? "", {
    enabled: Boolean(submissionId) && open,
  });

  const handleCopyId = async () => {
    if (!submission?.id) return;
    try {
      await navigator.clipboard.writeText(submission.id);
      setCopiedId(true);
      toast.success("Submission ID copied to clipboard");
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast.error("Failed to copy ID");
    }
  };

  const formatTimestamp = (date: Date | string | null) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "—";
    const secs = Math.round(ms / 1000);
    if (secs < 60) return `${secs} seconds`;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}m ${remSecs}s`;
  };

  const renderAnswerValue = (value: unknown, questionType?: string) => {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground italic text-xs">No response provided</span>;
    }

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs font-normal">
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "outline"} className="text-xs font-normal">
          {value ? "Yes / Confirmed" : "No / Unchecked"}
        </Badge>
      );
    }

    if (questionType === "email" && typeof value === "string") {
      return (
        <a
          href={`mailto:${value}`}
          className="text-xs font-mono text-primary underline hover:opacity-80"
        >
          {value}
        </a>
      );
    }

    if (
      (questionType === "linear_rating" || questionType === "star_rating") &&
      !isNaN(Number(value))
    ) {
      const score = Number(value);
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${
                  i < score ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs font-semibold text-foreground">{score}</span>
        </div>
      );
    }

    return (
      <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
        {String(value)}
      </div>
    );
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="size-3.5 text-muted-foreground" />;
      case "tablet":
        return <Tablet className="size-3.5 text-muted-foreground" />;
      default:
        return <Monitor className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col bg-background/95 backdrop-blur-md border-l border-border/80 shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="p-4 sm:p-6 border-b border-border/60 bg-muted/10 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base sm:text-lg font-semibold truncate text-foreground">
                  Response Details
                </SheetTitle>
                {submission && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-normal ${
                      submission.submittedAt
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {submission.submittedAt ? "Completed" : "In Progress"}
                  </Badge>
                )}
              </div>
              <SheetDescription className="text-xs text-muted-foreground truncate">
                Immutable response record snapshot
              </SheetDescription>
            </div>

            {/* Prev / Next Pagination */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={onNavigatePrev}
                disabled={!hasPrev}
                className="h-8 w-8 rounded-lg border-border/60"
                title="Previous submission"
                aria-label="Previous submission"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onNavigateNext}
                disabled={!hasNext}
                className="h-8 w-8 rounded-lg border-border/60"
                title="Next submission"
                aria-label="Next submission"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Submission UUID Pill */}
          {submission && (
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground pt-1">
              <span className="truncate max-w-[260px] sm:max-w-sm">ID: {submission.id}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="hover:text-foreground p-0.5"
                title="Copy submission ID"
                aria-label="Copy submission ID"
              >
                {copiedId ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>
          )}
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : !submission ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              Submission not found.
            </div>
          ) : (
            <>
              {/* Metadata Grid */}
              <div className="panel-highlight rounded-xl border border-border/80 bg-muted/15 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Submission Metadata
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Submitted At</span>
                    <span className="font-mono text-foreground">
                      {formatTimestamp(submission.submittedAt || submission.startedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Completion Duration</span>
                    <span className="font-mono text-foreground">
                      {formatDuration(submission.completionDurationMs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Device & Platform</span>
                    <span className="flex items-center gap-1.5 text-foreground capitalize mt-0.5">
                      {getDeviceIcon(submission.deviceType)}
                      <span>
                        {submission.deviceType || "Desktop"} · {submission.osName || "Unknown OS"}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Browser & Location</span>
                    <span className="flex items-center gap-1.5 text-foreground mt-0.5">
                      <Globe className="size-3.5 text-muted-foreground" />
                      <span>
                        {submission.browserName || "Unknown"} ({submission.countryCode || "Global"})
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Answers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Questions & Answers ({submission.answers.length})
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Version snapshot
                  </span>
                </div>

                {submission.answers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3">
                    No answer values recorded for this submission.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {submission.answers.map((ans, idx) => (
                      <div
                        key={ans.id}
                        className="panel-highlight rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {idx + 1}. {ans.questionLabel || "Untitled Question"}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground font-mono shrink-0"
                          >
                            {ans.questionType.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="pt-1">
                          {renderAnswerValue(ans.value, ans.questionType)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
