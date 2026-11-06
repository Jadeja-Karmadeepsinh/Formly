"use client";

import * as React from "react";
import { CheckCircle2, Clock, Percent, Users } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { SubmissionStatsResult } from "~/hooks/api/form-submission";

interface AnalyticsMetricsProps {
  overview: SubmissionStatsResult | null;
  isLoading?: boolean;
}

export function AnalyticsMetrics({ overview, isLoading }: AnalyticsMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/60 bg-card/60 shadow-2xs">
            <CardContent className="p-4 sm:p-5 space-y-2.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalStarted = overview?.totalStarted ?? 0;
  const totalCompleted = overview?.totalCompleted ?? 0;
  const totalInProgress = overview?.totalInProgress ?? 0;
  const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;
  const avgSec = overview?.averageDurationSeconds ?? null;

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "—";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Metric 1: Total Starts */}
      <Card className="border-border/60 bg-card/75 shadow-2xs transition-all hover:border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Form Starts</span>
            <Users className="size-4 text-muted-foreground/70" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
            {totalStarted.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalInProgress > 0
              ? `${totalInProgress.toLocaleString()} in progress / abandoned`
              : "All starts completed"}
          </p>
        </CardContent>
      </Card>

      {/* Metric 2: Completed Submissions */}
      <Card className="border-border/60 bg-card/75 shadow-2xs transition-all hover:border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed</span>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
            {totalCompleted.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Successfully submitted responses
          </p>
        </CardContent>
      </Card>

      {/* Metric 3: Completion Rate */}
      <Card className="border-border/60 bg-card/75 shadow-2xs transition-all hover:border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completion Rate</span>
            <Percent className="size-4 text-muted-foreground/70" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
              {completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metric 4: Average Duration */}
      <Card className="border-border/60 bg-card/75 shadow-2xs transition-all hover:border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Avg. Duration</span>
            <Clock className="size-4 text-muted-foreground/70" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
            {formatDuration(avgSec)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            From first start to submission
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

