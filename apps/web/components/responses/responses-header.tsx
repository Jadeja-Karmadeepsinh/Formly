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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-border/60">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Inbox className="size-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Responses Inbox
            </h1>
            <Badge
              variant="secondary"
              className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border border-border/70 bg-muted/60"
            >
              {totalCount.toLocaleString()} {totalCount === 1 ? "record" : "records"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inspect, filter, and audit verified respondent submissions across all forms.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isExporting || totalCount === 0}
          className="h-8 text-xs rounded-lg border-border/80 gap-1.5 shadow-2xs hover:bg-muted font-medium active:scale-[0.98] transition-all cursor-pointer"
        >
          {isExporting ? (
            <Loader2 className="size-3.5 animate-spin text-primary" />
          ) : (
            <Download className="size-3.5 text-muted-foreground" />
          )}
          <span>Export CSV</span>
        </Button>
      </div>
    </div>
  );
}
