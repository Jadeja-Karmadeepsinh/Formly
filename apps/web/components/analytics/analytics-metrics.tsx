"use client";

import * as React from "react";
import { CheckCircle2, Clock, Percent, Users } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { MetricExplainer } from "./metric-explainer";
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
              <Skeleton className="h-8 w-20" />
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          At a Glance
        </h2>
        <span className="text-[11px] text-muted-foreground">
          Key conversion and volume signals
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Completed Submissions (Primary Business Metric) */}
        <Card className="border-border/70 bg-card shadow-2xs transition-all hover:border-primary/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/80" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-foreground">
                Total Submissions
              </span>
              <div className="flex items-center gap-1">
                <MetricExplainer
                  title="Total Submissions"
                  description="The total count of completed form responses received during the selected date range. Only submissions where the respondent clicked submit and answered all required fields are counted."
                  tip="A submission represents a fully submitted business record in your database."
                />
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>
            </div>

            <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
              {totalCompleted.toLocaleString()}
            </div>

            <p className="mt-1 text-xs text-muted-foreground leading-normal">
              Completed responses received
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Form Starts (Sessions) */}
        <Card className="border-border/60 bg-card/75 shadow-2xs transition-all hover:border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Form Starts
              </span>
              <div className="flex items-center gap-1">
                <MetricExplainer
                  title="Form Starts"
                  description="The total number of visitor sessions that opened the form and began interacting with questions."
                  formula="Form Starts = Completed + In Progress / Abandoned"
                  tip="If starts are high but submissions are low, questions may be confusing or too lengthy."
                />
                <Users className="size-4 text-muted-foreground/70 shrink-0" />
              </div>
            </div>

            <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
              {totalStarted.toLocaleString()}
            </div>

            <p className="mt-1 text-xs text-muted-foreground leading-normal">
              {totalInProgress > 0
                ? `${totalInProgress.toLocaleString()} in progress / abandoned`
                : "All tracked starts completed"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Completion Rate */}
        <Card className="border-border/60 bg-card/75 shadow-2xs transition-all hover:border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Completion Rate
              </span>
              <div className="flex items-center gap-1">
                <MetricExplainer
                  title="Completion Rate"
                  description="The percentage of visitors who started your form and went on to successfully submit it."
                  formula="(Completed Submissions ÷ Form Starts) × 100%"
                  tip="A completion rate above 60% is typical for well-optimized, concise forms."
                />
                <Percent className="size-4 text-muted-foreground/70 shrink-0" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
                {completionRate.toFixed(1)}%
              </span>
            </div>

            <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionRate >= 60 ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Average Duration */}
        <Card className="border-border/60 bg-card/75 shadow-2xs transition-all hover:border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Avg. Completion Time
              </span>
              <div className="flex items-center gap-1">
                <MetricExplainer
                  title="Average Completion Time"
                  description="The average time elapsed between when a respondent began answering questions and when they completed the final submission."
                  formula="Average of (submitted_at - started_at) across completed sessions"
                  tip="Shorter completion times usually correlate with higher completion rates."
                />
                <Clock className="size-4 text-muted-foreground/70 shrink-0" />
              </div>
            </div>

            <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
              {formatDuration(avgSec)}
            </div>

            <p className="mt-1 text-xs text-muted-foreground leading-normal">
              From first start to submission
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
