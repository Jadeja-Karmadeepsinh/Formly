"use client";

import * as React from "react";
import {
  Archive,
  CheckCircle2,
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
  const inactiveCount = closedCount + archivedCount;

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
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums font-mono">
                {publishedCount}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {publishedCount > 0
                ? `${pluralize(publishedCount, "form")} published`
                : "No published forms"}
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

        {/* Cell 4: Inactive (Closed & Archived aggregate) */}
        <div
          onClick={() => onSelectStatus?.(closedCount > 0 ? "closed" : "archived")}
          className={`p-4 sm:p-5 flex flex-col justify-between transition-colors ${
            onSelectStatus ? "cursor-pointer hover:bg-muted/15" : ""
          } ${activeStatus === "closed" || activeStatus === "archived" ? "bg-muted/20" : ""}`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Inactive
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              <Archive className="size-3.5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums font-mono">
                {inactiveCount}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {inactiveCount > 0
                ? `${closedCount} closed · ${archivedCount} archived`
                : "0 closed · 0 archived"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
