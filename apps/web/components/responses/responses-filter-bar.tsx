"use client";

import * as React from "react";
import { Calendar, Filter, RotateCcw, Search, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { FormItem } from "~/hooks/api/form";

interface ResponsesFilterBarProps {
  forms: FormItem[];
  selectedFormId: string | undefined;
  onSelectFormId: (formId: string | undefined) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  statusFilter: "all" | "completed" | "in_progress";
  onChangeStatusFilter: (status: "all" | "completed" | "in_progress") => void;
  dateRange: "all" | "7d" | "30d" | "90d";
  onChangeDateRange: (range: "all" | "7d" | "30d" | "90d") => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export function ResponsesFilterBar({
  forms,
  selectedFormId,
  onSelectFormId,
  searchQuery,
  onChangeSearchQuery,
  statusFilter,
  onChangeStatusFilter,
  dateRange,
  onChangeDateRange,
  onResetFilters,
  isFiltered,
}: ResponsesFilterBarProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const statuses: Array<{ id: "all" | "completed" | "in_progress"; label: string }> = [
    { id: "all", label: "All Statuses" },
    { id: "completed", label: "Completed" },
    { id: "in_progress", label: "In Progress" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by ID or keywords... (/)"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            className="pl-8 pr-7 h-8 text-xs rounded-lg bg-card border-border/80 shadow-2xs font-sans placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onChangeSearchQuery("")}
              className="absolute right-2 top-2 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer rounded"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Status Segmented Control Pills */}
        <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60">
          {statuses.map((s) => {
            const active = statusFilter === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChangeStatusFilter(s.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  active
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Form Selector Dropdown */}
        <Select
          value={selectedFormId ?? "all"}
          onValueChange={(val) => onSelectFormId(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-[180px] sm:w-[200px] h-8 text-xs rounded-lg border-border/80 bg-card shadow-2xs">
            <Filter className="size-3 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Forms" />
          </SelectTrigger>
          <SelectContent className="text-xs rounded-xl shadow-md">
            <SelectItem value="all" className="cursor-pointer">
              All Forms
            </SelectItem>
            {forms.map((f) => (
              <SelectItem key={f.id} value={f.id} className="cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`size-1.5 rounded-full ${
                      f.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="truncate max-w-[150px] inline-block">{f.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Selector */}
        <Select
          value={dateRange}
          onValueChange={(val) => onChangeDateRange(val as "all" | "7d" | "30d" | "90d")}
        >
          <SelectTrigger className="w-[125px] sm:w-[135px] h-8 text-xs rounded-lg border-border/80 bg-card shadow-2xs">
            <Calendar className="size-3 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="text-xs rounded-xl shadow-md">
            <SelectItem value="all" className="cursor-pointer">All time</SelectItem>
            <SelectItem value="7d" className="cursor-pointer">Last 7 days</SelectItem>
            <SelectItem value="30d" className="cursor-pointer">Last 30 days</SelectItem>
            <SelectItem value="90d" className="cursor-pointer">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
