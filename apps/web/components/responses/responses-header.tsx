"use client";

import * as React from "react";
import { Download, Inbox, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface ResponsesHeaderProps {
  totalCount: number;
  onExport: () => void;
  isExporting?: boolean;
}

export function ResponsesHeader({
  totalCount,
  onExport,
  isExporting,
}: ResponsesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground">
            Responses
          </h1>
          <Badge
            variant="secondary"
            className="text-xs font-mono font-medium px-2 py-0.5 rounded-md"
          >
            {totalCount.toLocaleString()} {totalCount === 1 ? "response" : "responses"}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Search, filter, inspect, and export respondent submissions across your forms.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isExporting}
          className="h-9 text-xs rounded-lg border-border/60 gap-1.5 shadow-2xs hover:bg-muted font-medium active:scale-[0.98] transition-all"
        >
          {isExporting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          <span>Export CSV</span>
        </Button>
      </div>
    </div>
  );
}

