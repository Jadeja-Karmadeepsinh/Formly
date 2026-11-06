"use client";

import * as React from "react";
import { BarChart3, Calendar, Filter, RotateCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Monitor form performance, completion rates, and respondent distribution trends.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Form Selector */}
        <Select
          value={selectedFormId ?? "all"}
          onValueChange={(val) => onSelectFormId(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-[180px] sm:w-[210px] h-9 text-xs rounded-lg border-border/60 bg-card">
            <Filter className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Forms (Workspace)" />
          </SelectTrigger>
          <SelectContent className="text-xs rounded-xl">
            <SelectItem value="all" className="cursor-pointer">
              All Forms (Workspace)
            </SelectItem>
            {forms.map((f) => (
              <SelectItem key={f.id} value={f.id} className="cursor-pointer">
                <span className="truncate max-w-[170px] inline-block">{f.title}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Selector */}
        <Select
          value={dateRange}
          onValueChange={(val) => onChangeDateRange(val as "7d" | "30d" | "90d" | "all")}
        >
          <SelectTrigger className="w-[130px] sm:w-[145px] h-9 text-xs rounded-lg border-border/60 bg-card">
            <Calendar className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="text-xs rounded-xl">
            <SelectItem value="7d" className="cursor-pointer">Last 7 days</SelectItem>
            <SelectItem value="30d" className="cursor-pointer">Last 30 days</SelectItem>
            <SelectItem value="90d" className="cursor-pointer">Last 90 days</SelectItem>
            <SelectItem value="all" className="cursor-pointer">All time</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh */}
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 w-9 rounded-lg border-border/60 text-muted-foreground hover:text-foreground shrink-0"
          title="Refresh analytics"
          aria-label="Refresh analytics"
        >
          <RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

