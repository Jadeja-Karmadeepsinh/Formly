"use client";

import * as React from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Inbox,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { toast } from "sonner";
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
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { AllSubmissionsListItem } from "~/hooks/api/form-submission";

interface ResponsesTableProps {
  items: AllSubmissionsListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onInspectSubmission: (submissionId: string) => void;
}

export function ResponsesTable({
  items,
  totalCount,
  page,
  limit,
  totalPages,
  isLoading,
  onPageChange,
  onLimitChange,
  onInspectSubmission,
}: ResponsesTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyId = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success("Submission ID copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "—";
    const secs = Math.round(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}m ${remSecs}s`;
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

  if (isLoading) {
    return (
      <Card className="panel-highlight border-border/80 bg-card shadow-2xs">
        <CardContent className="p-0">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="panel-highlight border-border/80 bg-card shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground mb-3">
            <Inbox className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No responses found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search query, status filter, or date range to discover matching submissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);

  return (
    <Card className="panel-highlight border-border/80 bg-card shadow-2xs">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-4 sm:pl-5 w-[140px]">
                  ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Form
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Submitted
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Duration
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Device & Browser
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">
                  Answers
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-4 sm:pr-5">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((sub) => {
                const isCompleted = Boolean(sub.submittedAt);
                const shortId = sub.id.slice(0, 8);

                return (
                  <TableRow
                    key={sub.id}
                    onClick={() => onInspectSubmission(sub.id)}
                    className="hover:bg-muted/20 transition-colors border-b border-border/40 cursor-pointer"
                  >
                    {/* Submission ID */}
                    <TableCell className="pl-4 sm:pl-5 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <span>#{shortId}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(sub.id, e)}
                          className="hover:text-foreground transition-colors p-0.5"
                          title="Copy full UUID"
                          aria-label="Copy full UUID"
                        >
                          {copiedId === sub.id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Form Title & Badge */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2 max-w-[200px] sm:max-w-xs">
                        <span className="font-medium text-xs sm:text-sm text-foreground truncate">
                          {sub.formTitle}
                        </span>
                        {sub.formStatus === "published" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-normal shrink-0"
                          >
                            Live
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-normal shrink-0"
                          >
                            Draft
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      {isCompleted ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="size-3" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          <Clock className="size-3" />
                          <span>In Progress</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Submitted At */}
                    <TableCell className="font-mono text-xs text-muted-foreground py-3">
                      {formatTimestamp(sub.submittedAt || sub.startedAt)}
                    </TableCell>

                    {/* Duration */}
                    <TableCell className="font-mono text-xs text-muted-foreground py-3">
                      {formatDuration(sub.completionDurationMs)}
                    </TableCell>

                    {/* Device & Browser */}
                    <TableCell className="hidden md:table-cell py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getDeviceIcon(sub.deviceType)}
                        <span className="truncate max-w-[120px]">
                          {sub.browserName || "Unknown"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Answers Count */}
                    <TableCell className="text-center py-3">
                      <Badge variant="secondary" className="text-[11px] font-mono font-normal">
                        {sub.answersCount}
                      </Badge>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right pr-4 sm:pr-5 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectSubmission(sub.id);
                        }}
                        className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Eye className="size-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t border-border/60 bg-muted/10 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-medium text-foreground">{startRecord}</span> to{" "}
              <span className="font-medium text-foreground">{endRecord}</span> of{" "}
              <span className="font-medium text-foreground">{totalCount}</span> results
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Limit Selector */}
            <div className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <Select
                value={String(limit)}
                onValueChange={(val) => onLimitChange(Number(val))}
              >
                <SelectTrigger className="h-7 w-16 text-xs rounded-md border-border/60 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs rounded-lg">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="h-7 px-2.5 text-xs rounded-md border-border/60"
              >
                Previous
              </Button>
              <div className="px-2 font-mono text-xs">
                {page} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="h-7 px-2.5 text-xs rounded-md border-border/60"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
