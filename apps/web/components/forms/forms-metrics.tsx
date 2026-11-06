"use client";

import * as React from "react";
import {
  CheckCircle2,
  FilePenLine,
  Files,
  Globe,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { type FormItem } from "~/hooks/api/form";

interface FormsMetricsProps {
  forms: FormItem[];
  isLoading: boolean;
}

export function FormsMetrics({ forms, isLoading }: FormsMetricsProps) {
  const totalCount = forms.length;
  const publishedCount = forms.filter((f) => f.status === "published").length;
  const draftCount = forms.filter((f) => f.status === "draft").length;
  const publicCount = forms.filter((f) => f.visibility === "public").length;
  const unlistedCount = forms.filter((f) => f.visibility === "unlisted").length;

  return (
    <div className="panel-highlight rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
        {/* Cell 1: Forms Directory */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Directory</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              <Files className="size-3.5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums font-mono">
                {totalCount}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-3 w-28 mt-0.5" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="text-foreground font-medium">{publishedCount}</span> published · <span className="text-foreground font-medium">{draftCount}</span> drafts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cell 2: Live Published */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live Status</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums font-mono">
                  {publishedCount}
                </span>
                {publishedCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Offline</span>
                )}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {publishedCount > 0 ? "Accepting responses" : "No live forms published"}
            </div>
          </div>
        </div>

        {/* Cell 3: Visibility Breakdown */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Distribution</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              <Globe className="size-3.5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums font-mono">
                  {publicCount}
                </span>
                <span className="text-xs text-muted-foreground">Public</span>
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-3 w-28 mt-0.5" /> : `${unlistedCount} unlisted private links`}
            </div>
          </div>
        </div>

        {/* Cell 4: Drafts & In-Progress */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">In Progress</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              <FilePenLine className="size-3.5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums font-mono">
                {draftCount}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {draftCount > 0 ? "Under preparation in editor" : "All forms published"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
