"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Filter,
  Inbox,
  RotateCw,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import type { FormItem } from "~/hooks/api/form";

interface AnalyticsHeaderProps {
  forms: FormItem[];
  selectedFormId: string | undefined;
  onSelectFormId: (formId: string | undefined) => void;
  dateRange: "7d" | "30d" | "90d" | "all";
  onChangeDateRange: (range: "7d" | "30d" | "90d" | "all") => void;
  isRefreshing?: boolean;
  onRefresh: () => void;
}

export function AnalyticsHeader({
  forms,
  selectedFormId,
  onSelectFormId,
  dateRange,
  onChangeDateRange,
  isRefreshing,
  onRefresh,
}: AnalyticsHeaderProps) {
  const selectedForm = React.useMemo(() => {
    return forms.find((f) => f.id === selectedFormId);
  }, [forms, selectedFormId]);

  const dateRangeLabel = React.useMemo(() => {
    const now = new Date();
    const nowStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (dateRange === "7d") {
      const past = new Date(now);
      past.setDate(now.getDate() - 7);
      return `${past.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${nowStr} (7 days)`;
    }
    if (dateRange === "30d") {
      const past = new Date(now);
      past.setDate(now.getDate() - 30);
      return `${past.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${nowStr} (30 days)`;
    }
    if (dateRange === "90d") {
      const past = new Date(now);
      past.setDate(now.getDate() - 90);
      return `${past.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${nowStr} (90 days)`;
    }
    return "All time history";
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-4 pb-5 border-b border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground">
              Analytics
            </h1>
            {selectedForm && (
              <Badge
                variant="secondary"
                className="text-xs font-normal gap-1 pl-2 pr-1 py-0.5 border border-border/60"
              >
                <span className="truncate max-w-[130px] sm:max-w-[200px]">
                  {selectedForm.title}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectFormId(undefined)}
                  className="hover:bg-muted p-0.5 rounded cursor-pointer text-muted-foreground hover:text-foreground"
                  title="Clear form filter"
                  aria-label="Clear form filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor response conversion, submission timelines, and respondent behavior.
          </p>
        </div>

        {/* Action button to Responses table */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs gap-1.5 border-border/70 shadow-2xs hover:bg-muted font-medium active:scale-[0.98] transition-all"
          >
            <Link
              href={
                selectedFormId
                  ? `/dashboard/responses?formId=${selectedFormId}`
                  : `/dashboard/responses`
              }
            >
              <Inbox className="size-3.5 text-muted-foreground" />
              <span>Responses Inbox</span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex size-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-mono text-[11px]" suppressHydrationWarning>
            {dateRangeLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Form Selector */}
          <Select
            value={selectedFormId ?? "all"}
            onValueChange={(val) => onSelectFormId(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-[170px] sm:w-[200px] h-8 text-xs rounded-lg border-border/60 bg-card">
              <Filter className="size-3 mr-1 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Forms (Workspace)" />
            </SelectTrigger>
            <SelectContent className="text-xs rounded-xl">
              <SelectItem value="all" className="cursor-pointer">
                All Forms (Workspace)
              </SelectItem>
              {forms.map((f) => (
                <SelectItem key={f.id} value={f.id} className="cursor-pointer">
                  <span className="truncate max-w-[160px] inline-block">{f.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Selector */}
          <Select
            value={dateRange}
            onValueChange={(val) => onChangeDateRange(val as "7d" | "30d" | "90d" | "all")}
          >
            <SelectTrigger className="w-[125px] sm:w-[135px] h-8 text-xs rounded-lg border-border/60 bg-card">
              <Calendar className="size-3 mr-1 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent className="text-xs rounded-xl">
              <SelectItem value="7d" className="cursor-pointer">Last 7 days</SelectItem>
              <SelectItem value="30d" className="cursor-pointer">Last 30 days</SelectItem>
              <SelectItem value="90d" className="cursor-pointer">Last 90 days</SelectItem>
              <SelectItem value="all" className="cursor-pointer">All time</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 rounded-lg border-border/60 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer active:scale-95 transition-all"
            title="Refresh analytics"
            aria-label="Refresh analytics"
          >
            <RotateCw className={`size-3 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
