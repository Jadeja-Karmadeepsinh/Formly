"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Inbox,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Dialog,
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

interface FormSubmissionsSheetProps {
  form: FormItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormSubmissionsSheet({
  form,
  open,
  onOpenChange,
}: FormSubmissionsSheetProps) {
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

  const formatDuration = (ms: number | null) => {
    if (!ms) return "—";
    const totalSecs = Math.round(ms / 1000);
    if (totalSecs < 60) return `${totalSecs}s`;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (dateStr: string | Date | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="size-3.5" />;
      case "tablet":
        return <Tablet className="size-3.5" />;
      default:
        return <Monitor className="size-3.5" />;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-md border-l border-border/80 shadow-2xl"
        >
          {/* Header */}
          <SheetHeader className="p-4 sm:p-6 border-b border-border/60 bg-muted/10 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base sm:text-lg font-semibold truncate text-foreground">
                    {form?.title || "Form Submissions"}
                  </SheetTitle>
                  {form?.status && (
                    <Badge
                      variant="outline"
                      className={
                        form.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] h-5"
                          : "text-[10px] h-5"
                      }
                    >
                      {form.status}
                    </Badge>
                  )}
                </div>
                <SheetDescription className="text-xs text-muted-foreground">
                  View and inspect collected responses and submission analytics.
                </SheetDescription>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {form?.shareId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-8 gap-1.5 text-xs rounded-lg"
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
                  className="size-8 text-muted-foreground"
                  onClick={() => {
                    refetchSubmissions();
                    refetchStats();
                  }}
                  title="Refresh responses"
                >
                  <RotateCw className="size-4" />
                </Button>
              </div>
            </div>

            {/* Quick Summary Strip */}
            <div className="grid grid-cols-4 gap-2 pt-4">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Total
                </span>
                <div className="text-lg font-semibold tabular-nums text-foreground mt-0.5">
                  {isStatsLoading ? <Skeleton className="h-6 w-10" /> : (stats?.totalStarted ?? totalCount)}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Completed
                </span>
                <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {isStatsLoading ? <Skeleton className="h-6 w-10" /> : (stats?.totalCompleted ?? 0)}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="text-[11px] text-muted-foreground font-medium">
                  In Progress
                </span>
                <div className="text-lg font-semibold tabular-nums text-foreground mt-0.5">
                  {isStatsLoading ? <Skeleton className="h-6 w-10" /> : (stats?.totalInProgress ?? 0)}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Avg Time
                </span>
                <div className="text-lg font-semibold tabular-nums text-foreground mt-0.5">
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
          </SheetHeader>

          {/* Submissions Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                    className="mt-4 gap-1.5 text-xs rounded-lg"
                  >
                    <Copy className="size-3.5" />
                    <span>Copy Share Link</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-border/80 overflow-hidden bg-background">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs hover:bg-transparent">
                      <TableHead className="w-[120px]">Submission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub, index) => {
                      const isCompleted = sub.submittedAt !== null;
                      return (
                        <TableRow key={sub.id} className="text-xs group">
                          <TableCell className="font-mono text-muted-foreground">
                            #{submissions.length - index}
                          </TableCell>
                          <TableCell>
                            {isCompleted ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] h-4.5 font-medium"
                              >
                                Completed
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-muted-foreground text-[10px] h-4.5 font-medium"
                              >
                                Started
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
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSubmissionId(sub.id)}
                              className="h-7 text-xs px-2 text-foreground font-medium hover:bg-muted"
                            >
                              View Answers
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Answer Inspector Modal */}
      {selectedSubmissionId && (
        <SubmissionAnswerModal
          submissionId={selectedSubmissionId}
          open={Boolean(selectedSubmissionId)}
          onOpenChange={(open) => {
            if (!open) setSelectedSubmissionId(null);
          }}
        />
      )}
    </>
  );
}

function SubmissionAnswerModal({
  submissionId,
  open,
  onOpenChange,
}: {
  submissionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { submission, isLoading } = useSubmission(submissionId, {
    enabled: Boolean(submissionId) && open,
  });

  const renderAnswerValue = (value: unknown, _questionType?: string) => {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground italic">No answer</span>;
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
        <span className="font-semibold text-xs">
          {value ? "✓ Yes / Checked" : "✕ No / Unchecked"}
        </span>
      );
    }

    return (
      <span className="text-xs text-foreground whitespace-pre-wrap">
        {String(value)}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl p-6">
        <DialogHeader className="pb-3 border-b border-border/80">
          <DialogTitle className="text-base font-semibold text-foreground">
            Submission Details
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Recorded {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 max-h-[60vh] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !submission?.answers || submission.answers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No answers recorded for this attempt.
            </div>
          ) : (
            submission.answers.map((ans, idx) => (
              <div
                key={ans.id}
                className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {idx + 1}. {ans.questionLabel || "Untitled Question"}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                    {ans.questionType}
                  </Badge>
                </div>
                <div className="text-xs">
                  {renderAnswerValue(ans.value, ans.questionType)}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
