"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Clock, Percent, Users } from "lucide-react";
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
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
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
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            Conversion Funnel & Volume
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Live session telemetry
        </span>
      </div>

      {/* Unified KPI Command Rail */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cell 1: Form Starts */}
        <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-muted/15 transition-colors group relative">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="size-3.5 text-muted-foreground" />
                <span>Form Starts</span>
              </div>
              <MetricExplainer
                title="Form Starts"
                description="The total number of visitor sessions that opened the form and began interacting with questions."
                formula="Form Starts = Completed + In Progress / Abandoned"
                tip="If starts are high but submissions are low, questions may be confusing or too lengthy."
              />
            </div>

            <div className="mt-2.5 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
              {totalStarted.toLocaleString()}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <span>
              {totalInProgress > 0
                ? `${totalInProgress.toLocaleString()} drop-offs`
                : "All sessions completed"}
            </span>
            <ArrowRight className="size-3 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Cell 2: Total Completed Submissions */}
        <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-muted/15 transition-colors group relative">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Total Submissions</span>
              </div>
              <MetricExplainer
                title="Total Submissions"
                description="The total count of completed form responses received during the selected date range. Only submissions where the respondent clicked submit and answered all required fields are counted."
                tip="A submission represents a fully submitted business record in your database."
              />
            </div>

            <div className="mt-2.5 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
              {totalCompleted.toLocaleString()}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Verified submissions
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/80">100% captured</span>
          </div>
        </div>

        {/* Cell 3: Completion Rate */}
        <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-muted/15 transition-colors group relative">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Percent className="size-3.5 text-muted-foreground" />
                <span>Completion Rate</span>
              </div>
              <MetricExplainer
                title="Completion Rate"
                description="The percentage of visitors who started your form and went on to successfully submit it."
                formula="(Completed Submissions ÷ Form Starts) × 100%"
                tip="A completion rate above 60% is typical for well-optimized, concise forms."
              />
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
                {completionRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border/40 space-y-1.5">
            <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionRate >= 60
                    ? "bg-emerald-500"
                    : completionRate >= 30
                    ? "bg-amber-500"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>Goal: 65%</span>
              <span>{completionRate >= 60 ? "Healthy" : "Needs Review"}</span>
            </div>
          </div>
        </div>

        {/* Cell 4: Average Duration */}
        <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-muted/15 transition-colors group relative">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5 text-muted-foreground" />
                <span>Avg. Completion Time</span>
              </div>
              <MetricExplainer
                title="Average Completion Time"
                description="The average time elapsed between when a respondent began answering questions and when they completed the final submission."
                formula="Average of (submitted_at - started_at) across completed sessions"
                tip="Shorter completion times usually correlate with higher completion rates."
              />
            </div>

            <div className="mt-2.5 text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-foreground">
              {formatDuration(avgSec)}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <span>Pacing velocity</span>
            <span className="font-mono text-[10px]">median response</span>
          </div>
        </div>
      </div>
    </div>
  );
}
