"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ExternalLink,
  Eye,
  FileQuestion,
  Inbox,
  LayoutList,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
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
import type { FormPerformanceItem } from "~/hooks/api/form-submission";

interface FormsPerformanceTableProps {
  formsPerformance: FormPerformanceItem[];
  onSelectForm: (formId: string) => void;
  selectedFormId?: string;
}

export function FormsPerformanceTable({
  formsPerformance,
  onSelectForm,
  selectedFormId,
}: FormsPerformanceTableProps) {
  if (formsPerformance.length === 0) {
    return (
      <Card className="border-border/60 bg-card/75 shadow-2xs">
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          No forms created in this workspace yet.
        </CardContent>
      </Card>
    );
  }

  const formatTimestamp = (date: Date | string | null) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "—";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="border-border/60 bg-card/75 shadow-2xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <LayoutList className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">
                Form Performance Breakdown
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Ranked comparison of response collection and conversion rates across your forms.
            </CardDescription>
          </div>
          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-md border border-border/40 shrink-0 self-start sm:self-auto">
            {formsPerformance.length} {formsPerformance.length === 1 ? "form" : "forms"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[32px] text-xs font-semibold text-muted-foreground pl-4 text-center">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Form Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                  Starts
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                  Completed
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                  Completion Rate
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right hidden sm:table-cell">
                  Avg. Time
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right hidden md:table-cell">
                  Last Activity
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-4 sm:pr-5">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formsPerformance.map((f, idx) => {
                const ratePercent = (f.completionRate * 100).toFixed(1);
                const isSelected = selectedFormId === f.formId;

                return (
                  <TableRow
                    key={f.formId}
                    className={`hover:bg-muted/25 transition-colors border-b border-border/40 ${
                      isSelected ? "bg-muted/30 font-medium" : ""
                    }`}
                  >
                    {/* Rank */}
                    <TableCell className="pl-4 py-3 text-center font-mono text-xs text-muted-foreground">
                      {idx === 0 ? (
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                          1
                        </span>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </TableCell>

                    {/* Form Title & Status */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectForm(f.formId)}
                          className="font-medium text-xs sm:text-sm text-foreground hover:text-primary transition-colors text-left truncate max-w-[160px] sm:max-w-xs cursor-pointer"
                        >
                          {f.title}
                        </button>
                        {f.status === "published" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-normal shrink-0"
                          >
                            Live
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-normal shrink-0"
                          >
                            Draft
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Starts */}
                    <TableCell className="text-right font-mono text-xs text-muted-foreground py-3">
                      {f.totalStarted.toLocaleString()}
                    </TableCell>

                    {/* Completed */}
                    <TableCell className="text-right font-mono text-xs font-semibold text-foreground py-3">
                      {f.totalCompleted.toLocaleString()}
                    </TableCell>

                    {/* Rate */}
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-xs text-foreground">
                          {ratePercent}%
                        </span>
                        <div className="w-12 bg-muted rounded-full h-1.5 hidden sm:block overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              f.completionRate >= 0.6 ? "bg-emerald-500" : "bg-primary"
                            }`}
                            style={{ width: `${Math.min(f.completionRate * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Avg Duration */}
                    <TableCell className="text-right font-mono text-xs text-muted-foreground py-3 hidden sm:table-cell">
                      {formatDuration(f.avgDurationSeconds)}
                    </TableCell>

                    {/* Last Activity */}
                    <TableCell
                      className="text-right font-mono text-[11px] text-muted-foreground py-3 hidden md:table-cell"
                      suppressHydrationWarning
                    >
                      {formatTimestamp(f.lastSubmissionAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4 sm:pr-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          title="View Responses"
                        >
                          <Link href={`/dashboard/responses?formId=${f.formId}`}>
                            <Inbox className="size-3.5" />
                            <span className="hidden sm:inline">Responses</span>
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectForm(f.formId)}
                          className="h-7 text-xs px-2 gap-1 border-border/70 hover:bg-muted/80 cursor-pointer"
                          title="View Question-Level Insights"
                        >
                          <FileQuestion className="size-3 text-primary" />
                          <span className="hidden sm:inline">Insights</span>
                          <ChevronRight className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
