"use client";

import * as React from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Inbox,
  Monitor,
  RotateCw,
  Smartphone,
  Star,
  Tablet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { type FormItem } from "~/hooks/api/form";
import {
  useFormSubmissions,
  useFormSubmissionStats,
  useSubmission,
} from "~/hooks/api/form-submission";

interface FormSubmissionsDialogProps {
  form: FormItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// F-14: Centralized human-readable field-type mapping
const QUESTION_TYPE_MAP: Record<string, string> = {
  short_text: "Short Text",
  long_text: "Long Text",
  single_select: "Single Choice",
  multi_select: "Multiple Choice",
  dropdown: "Dropdown",
  linear_rating: "Rating",
  star_rating: "Star Rating",
  email: "Email",
  phone: "Phone",
  website_url: "Website",
  number: "Number",
  date: "Date",
  time: "Time",
  checkbox: "Checkbox",
  ranking: "Ranking",
  file_upload: "File Upload",
  matrix: "Matrix",
  statement: "Statement",
  payment: "Payment",
  signature: "Signature",
};

export function formatQuestionType(type?: string | null): string {
  if (!type) return "Question";
  if (QUESTION_TYPE_MAP[type]) return QUESTION_TYPE_MAP[type];
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDuration(ms: number | null) {
  if (!ms || ms < 0) return "—";
  const totalSecs = Math.round(ms / 1000);
  if (totalSecs < 60) return `${totalSecs}s`;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}m ${secs}s`;
}

function formatTimestamp(dateStr: string | Date | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDeviceIcon(deviceType: string | null) {
  switch (deviceType?.toLowerCase()) {
    case "mobile":
      return <Smartphone className="size-3.5" />;
    case "tablet":
      return <Tablet className="size-3.5" />;
    default:
      return <Monitor className="size-3.5" />;
  }
}

// Title Case Status helper
function formatStatusLabel(status?: string | null): string {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function FormSubmissionsDialog({
  form,
  open,
  onOpenChange,
}: FormSubmissionsDialogProps) {
  const formId = form?.id ?? "";
  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<string | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Real tRPC hooks
  const {
    items: submissions,
    totalCount,
    isLoading: isSubmissionsLoading,
    refetch: refetchSubmissions,
  } = useFormSubmissions(
    {
      formId,
      limit: 50,
      includeInProgress: true,
    },
    {
      enabled: open && Boolean(formId),
    }
  );

  const {
    stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useFormSubmissionStats(formId, {
    enabled: open && Boolean(formId),
  });

  // Calculate submission display sequence (#N)
  const selectedIndex = submissions.findIndex((s) => s.id === selectedSubmissionId);
  const selectedSubmissionNumber = selectedIndex >= 0 ? submissions.length - selectedIndex : null;

  const handleCopyLink = async () => {
    if (!form?.shareId) return;
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/f/${form.shareId}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedSubmissionId(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      {/* F-10, F-11: Centered modal Dialog with bounded dimensions & internal scrolling */}
      <DialogContent
        showCloseButton={false}
        className="flex w-[92vw] max-w-5xl h-[85vh] max-h-[85vh] flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl sm:max-w-5xl"
      >
        {selectedSubmissionId ? (
          /* F-12: Single-dialog submission details view (no nested modal) */
          <SubmissionDetailsView
            submissionId={selectedSubmissionId}
            submissionNumber={selectedSubmissionNumber}
            onBack={() => setSelectedSubmissionId(null)}
            onClose={() => handleDialogClose(false)}
          />
        ) : (
          /* Submissions List View */
          <>
            {/* Fixed Header + Fixed KPI Summary (shrink-0) */}
            <DialogHeader className="p-5 sm:p-6 border-b border-border/60 bg-muted/10 space-y-4 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-base sm:text-lg font-semibold truncate text-foreground">
                      {form?.title || "Form Submissions"}
                    </DialogTitle>
                    {form?.status && (
                      <Badge
                        variant="outline"
                        className={
                          form.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] h-5 font-medium gap-1"
                            : "bg-muted text-muted-foreground border-border/60 text-[10px] h-5 font-medium"
                        }
                      >
                        {form.status === "published" && (
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                        )}
                        <span>{formatStatusLabel(form.status)}</span>
                      </Badge>
                    )}
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground">
                    View and inspect collected responses and submission analytics.
                  </DialogDescription>
                </div>

                {/* F-13: Aligned Header Action Controls (Copy Link, Refresh, Close in one row) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {form?.shareId && form.status === "published" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="h-8 gap-1.5 text-xs rounded-lg cursor-pointer bg-background hover:bg-muted border-border/80"
                      title="Copy share link"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                    onClick={() => {
                      refetchSubmissions();
                      refetchStats();
                    }}
                    title="Refresh responses"
                  >
                    <RotateCw
                      className={`size-4 ${isSubmissionsLoading ? "animate-spin" : ""}`}
                    />
                  </Button>

                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      title="Close"
                    >
                      <X className="size-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogClose>
                </div>
              </div>

              {/* F-11: Fixed 4-card KPI summary strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Total
                  </span>
                  <div className="text-xl font-semibold tabular-nums text-foreground mt-0.5">
                    {isStatsLoading ? (
                      <Skeleton className="h-6 w-10" />
                    ) : (
                      stats?.totalStarted ?? totalCount
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Completed
                  </span>
                  <div className="text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {isStatsLoading ? (
                      <Skeleton className="h-6 w-10" />
                    ) : (
                      stats?.totalCompleted ?? 0
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    In Progress
                  </span>
                  <div className="text-xl font-semibold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                    {isStatsLoading ? (
                      <Skeleton className="h-6 w-10" />
                    ) : (
                      stats?.totalInProgress ?? 0
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Avg Time
                  </span>
                  <div className="text-xl font-semibold tabular-nums text-foreground mt-0.5">
                    {isStatsLoading ? (
                      <Skeleton className="h-6 w-12" />
                    ) : stats?.averageDurationSeconds ? (
                      `${stats.averageDurationSeconds}s`
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* F-11: Scrollable Submissions Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
              {isSubmissionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                    <Inbox className="size-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    No responses yet
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                    {form?.status === "published"
                      ? "Your form is published and ready. Share the public link with respondents to begin collecting data."
                      : "This form is currently a draft. Publish it to start accepting public responses."}
                  </p>
                  {form?.shareId && form.status === "published" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="mt-4 gap-1.5 text-xs rounded-lg cursor-pointer"
                    >
                      <Copy className="size-3.5" />
                      <span>Copy Share Link</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-2xs">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs hover:bg-transparent bg-muted/20 border-b border-border/70">
                        <TableHead className="w-[110px]">Submission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((sub, index) => {
                        const isCompleted = sub.submittedAt !== null;
                        const submissionNum = submissions.length - index;
                        const hasAnswers = sub.answersCount > 0;

                        return (
                          <TableRow
                            key={sub.id}
                            className="text-xs group hover:bg-muted/30 transition-colors border-b border-border/50 last:border-b-0"
                          >
                            <TableCell className="font-mono text-muted-foreground font-medium">
                              #{submissionNum}
                            </TableCell>
                            <TableCell>
                              {isCompleted ? (
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] h-4.5 font-medium gap-1"
                                >
                                  <span className="size-1 rounded-full bg-emerald-500" />
                                  <span>Completed</span>
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] h-4.5 font-medium gap-1"
                                >
                                  <span className="size-1 rounded-full bg-amber-500" />
                                  <span>Started</span>
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(sub.submittedAt || sub.startedAt)}
                            </TableCell>
                            <TableCell className="tabular-nums text-muted-foreground">
                              {formatDuration(sub.completionDurationMs)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                {getDeviceIcon(sub.deviceType)}
                                <span className="capitalize text-[11px]">
                                  {sub.deviceType || "desktop"}
                                </span>
                              </div>
                            </TableCell>
                            {/* F-13 & F-14: Right-aligned contextual actions */}
                            <TableCell className="text-right pr-4">
                              {isCompleted ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedSubmissionId(sub.id)}
                                  className="h-7 text-xs px-2.5 text-foreground font-medium hover:bg-muted cursor-pointer"
                                >
                                  View Answers
                                </Button>
                              ) : hasAnswers ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedSubmissionId(sub.id)}
                                  className="h-7 text-xs px-2.5 text-amber-600 dark:text-amber-400 font-medium hover:bg-amber-500/10 cursor-pointer"
                                >
                                  View Progress
                                </Button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground/50 italic px-2.5">
                                  No answers
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export backward-compatible alias so existing imports work seamlessly
export { FormSubmissionsDialog as FormSubmissionsSheet };

// F-12, F-14: Single-dialog submission details view
function SubmissionDetailsView({
  submissionId,
  submissionNumber,
  onBack,
  onClose,
}: {
  submissionId: string;
  submissionNumber: number | null;
  onBack: () => void;
  onClose: () => void;
}) {
  const { submission, isLoading, refetch } = useSubmission(submissionId, {
    enabled: Boolean(submissionId),
  });

  const isCompleted = Boolean(submission?.submittedAt);

  const renderAnswerValue = (value: unknown, questionType?: string) => {
    if (value === undefined || value === null || value === "") {
      return (
        <span className="text-muted-foreground/60 italic text-xs">
          No answer provided
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <span className="text-muted-foreground/60 italic text-xs">
            Empty list
          </span>
        );
      }
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((item, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs font-normal bg-muted/60 text-foreground border border-border/60"
            >
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
            value
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {value ? "✓ Yes / Checked" : "✕ No / Unchecked"}
        </span>
      );
    }

    if (questionType === "star_rating" || questionType === "linear_rating") {
      const num = Number(value);
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted/60 text-foreground border border-border/60">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span>{isNaN(num) ? String(value) : `${num} / ${questionType === "star_rating" ? 5 : 10}`}</span>
        </div>
      );
    }

    if (questionType === "website_url" || (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://")))) {
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium break-all"
        >
          <span>{String(value)}</span>
          <ExternalLink className="size-3 shrink-0" />
        </a>
      );
    }

    return (
      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words">
        {String(value)}
      </p>
    );
  };

  return (
    <>
      {/* Detail Header (shrink-0) */}
      <DialogHeader className="p-5 sm:p-6 border-b border-border/60 bg-muted/10 space-y-4 shrink-0">
        {/* Navigation & Controls Row */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer -ml-2"
          >
            <ArrowLeft className="size-4" />
            <span>Back to submissions</span>
          </Button>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              onClick={() => refetch()}
              title="Refresh submission details"
            >
              <RotateCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                title="Close"
              >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* F-14: Submission Details Metadata Strip */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
              Submission #{submissionNumber ?? "—"}
            </DialogTitle>
            {isCompleted ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] h-5 font-medium gap-1"
              >
                <span className="size-1 rounded-full bg-emerald-500" />
                <span>Completed</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] h-5 font-medium gap-1"
              >
                <span className="size-1 rounded-full bg-amber-500" />
                <span>In Progress</span>
              </Badge>
            )}
          </div>

          {/* Contextual Metadata Badges */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>
                {formatTimestamp(submission?.submittedAt || submission?.startedAt || null)}
              </span>
            </span>

            {submission?.completionDurationMs ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>{formatDuration(submission.completionDurationMs)}</span>
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1.5">
              {getDeviceIcon(submission?.deviceType || null)}
              <span className="capitalize">{submission?.deviceType || "Desktop"}</span>
            </span>

            {(submission?.browserName || submission?.osName) && (
              <span className="text-muted-foreground/80">
                {[submission.browserName, submission.osName].filter(Boolean).join(" · ")}
              </span>
            )}

            {submission?.countryCode && (
              <span className="inline-flex items-center gap-1 text-[11px] uppercase font-mono">
                <Globe className="size-3" />
                <span>{submission.countryCode}</span>
              </span>
            )}
          </div>
        </div>
      </DialogHeader>

      {/* Answers Body: Internally scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-3.5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !submission?.answers || submission.answers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <Inbox className="size-6" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              No answers recorded
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              This respondent started the form but did not submit any field answers.
            </p>
          </div>
        ) : (
          submission.answers.map((ans, idx) => (
            <div
              key={ans.id}
              className="rounded-xl border border-border/70 bg-card p-4 space-y-2 shadow-2xs hover:border-border transition-colors"
            >
              {/* Question Header: Number + Question Label + F-14 Human-Readable Field Type */}
              <div className="flex items-start justify-between gap-3 text-xs">
                <span className="font-semibold text-foreground leading-snug">
                  {idx + 1}. {ans.questionLabel || "Untitled Question"}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted-foreground font-medium shrink-0 bg-muted/40 border-border/70"
                >
                  {formatQuestionType(ans.questionType)}
                </Badge>
              </div>

              {/* Answer Value */}
              <div className="pt-0.5">
                {renderAnswerValue(ans.value, ans.questionType)}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

