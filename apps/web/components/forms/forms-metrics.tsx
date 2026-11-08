"use client";

import * as React from "react";
import {
  Archive,
  CheckCircle2,
  Clock,
  FilePenLine,
  Files,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { type FormItem } from "~/hooks/api/form";
import { pluralize } from "~/lib/format-utils";

interface FormsMetricsProps {
  forms: FormItem[];
  isLoading: boolean;
  onSelectStatus?: (status: "all" | "published" | "draft" | "closed" | "archived") => void;
  activeStatus?: string;
}

export function FormsMetrics({
  forms,
  isLoading,
  onSelectStatus,
  activeStatus,
}: FormsMetricsProps) {
  const totalCount = forms.length;
  const publishedCount = forms.filter((f) => f.status === "published").length;
  const draftCount = forms.filter((f) => f.status === "draft").length;
  const closedCount = forms.filter((f) => f.status === "closed").length;
  const archivedCount = forms.filter((f) => f.status === "archived").length;

  return (
    <div className="panel-highlight rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
        {/* Cell 1: Total Forms */}
        <div
          onClick={() => onSelectStatus?.("all")}
          className={`p-4 sm:p-5 flex flex-col justify-between transition-colors ${
            onSelectStatus ? "cursor-pointer hover:bg-muted/15" : ""
          } ${activeStatus === "all" ? "bg-muted/20" : ""}`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total Forms
            </span>
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
                <span>
                  {publishedCount} published · {pluralize(draftCount, "draft")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cell 2: Published */}
        <div
          onClick={() => onSelectStatus?.("published")}
          className={`p-4 sm:p-5 flex flex-col justify-between transition-colors ${
            onSelectStatus ? "cursor-pointer hover:bg-muted/15" : ""
          } ${activeStatus === "published" ? "bg-muted/20" : ""}`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Published
            </span>
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
              {publishedCount > 0 ? "Accepting live responses" : "No live forms published"}
            </div>
          </div>
        </div>

        {/* Cell 3: Drafts */}
        <div
          onClick={() => onSelectStatus?.("draft")}
          className={`p-4 sm:p-5 flex flex-col justify-between transition-colors ${
            onSelectStatus ? "cursor-pointer hover:bg-muted/15" : ""
          } ${activeStatus === "draft" ? "bg-muted/20" : ""}`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Drafts
            </span>
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
              {draftCount > 0
                ? `${pluralize(draftCount, "form")} in progress`
                : "All forms published"}
            </div>
          </div>
        </div>

        {/* Cell 4: Closed & Archived */}
        <div
          onClick={() => onSelectStatus?.(closedCount > 0 ? "closed" : "archived")}
          className={`p-4 sm:p-5 flex flex-col justify-between transition-colors ${
            onSelectStatus ? "cursor-pointer hover:bg-muted/15" : ""
          } ${activeStatus === "closed" || activeStatus === "archived" ? "bg-muted/20" : ""}`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Closed & Archived
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              {closedCount > 0 ? <Clock className="size-3.5" /> : <Archive className="size-3.5" />}
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums font-mono">
                {closedCount + archivedCount}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {closedCount + archivedCount > 0
                ? `${closedCount} closed · ${archivedCount} archived`
                : "No closed or archived forms"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
