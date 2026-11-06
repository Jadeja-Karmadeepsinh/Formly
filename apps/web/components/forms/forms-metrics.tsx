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
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {/* 1. Total Forms */}
      <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:bg-card/90 hover:border-border shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium tracking-wide">Total Forms</span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
            <Files className="size-3.5" />
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {totalCount}
            </div>
          )}
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {isLoading ? (
              <Skeleton className="h-3 w-28 mt-0.5" />
            ) : totalCount === 0 ? (
              "No forms created yet"
            ) : (
              `${publishedCount} published · ${draftCount} draft`
            )}
          </div>
        </div>
      </div>

      {/* 2. Active Published Forms */}
      <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:bg-card/90 hover:border-border shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium tracking-wide">Published</span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {publishedCount}
              </span>
              {publishedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
          )}
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {isLoading ? (
              <Skeleton className="h-3 w-24 mt-0.5" />
            ) : publishedCount === 0 ? (
              "None published yet"
            ) : (
              "Open for responses"
            )}
          </div>
        </div>
      </div>

      {/* 3. Draft Forms */}
      <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:bg-card/90 hover:border-border shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium tracking-wide">Drafts</span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
            <FilePenLine className="size-3.5" />
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {draftCount}
            </div>
          )}
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {isLoading ? (
              <Skeleton className="h-3 w-24 mt-0.5" />
            ) : draftCount === 0 ? (
              "No drafts in progress"
            ) : (
              "In preparation"
            )}
          </div>
        </div>
      </div>

      {/* 4. Visibility Breakdown */}
      <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:bg-card/90 hover:border-border shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium tracking-wide">Visibility</span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
            <Globe className="size-3.5" />
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {publicCount}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                public
              </span>
            </div>
          )}
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {isLoading ? (
              <Skeleton className="h-3 w-28 mt-0.5" />
            ) : (
              `${unlistedCount} unlisted`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
