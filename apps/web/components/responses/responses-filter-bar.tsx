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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by ID or form... (/)"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            className="pl-8 pr-7 h-9 text-xs rounded-lg bg-card border-border/60"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onChangeSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Form Selector */}
        <Select
          value={selectedFormId ?? "all"}
          onValueChange={(val) => onSelectFormId(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-[180px] sm:w-[200px] h-9 text-xs rounded-lg border-border/60 bg-card">
            <Filter className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Forms" />
          </SelectTrigger>
          <SelectContent className="text-xs rounded-xl">
            <SelectItem value="all" className="cursor-pointer">All Forms</SelectItem>
            {forms.map((f) => (
              <SelectItem key={f.id} value={f.id} className="cursor-pointer">
                <span className="truncate max-w-[160px] inline-block">{f.title}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(val) => onChangeStatusFilter(val as "all" | "completed" | "in_progress")}
        >
          <SelectTrigger className="w-[130px] sm:w-[140px] h-9 text-xs rounded-lg border-border/60 bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="text-xs rounded-xl">
            <SelectItem value="all" className="cursor-pointer">All Statuses</SelectItem>
            <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
            <SelectItem value="in_progress" className="cursor-pointer">In Progress</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Selector */}
        <Select
          value={dateRange}
          onValueChange={(val) => onChangeDateRange(val as "all" | "7d" | "30d" | "90d")}
        >
          <SelectTrigger className="w-[130px] sm:w-[140px] h-9 text-xs rounded-lg border-border/60 bg-card">
            <Calendar className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="text-xs rounded-xl">
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
            className="h-9 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}

