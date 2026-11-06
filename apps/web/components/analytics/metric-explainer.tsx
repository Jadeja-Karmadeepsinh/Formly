"use client";

import * as React from "react";
import { HelpCircle, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface MetricExplainerProps {
  title: string;
  description: string;
  formula?: string;
  tip?: string;
}

export function MetricExplainer({
  title,
  description,
  formula,
  tip,
}: MetricExplainerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                aria-label={`About ${title}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Info className="size-3.5" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs max-w-xs">
            {description}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-80 p-4 text-xs space-y-2.5 bg-popover/95 backdrop-blur-sm border-border/80 shadow-lg rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
          <HelpCircle className="size-4 text-primary shrink-0" />
          <span>{title}</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {formula && (
          <div className="p-2 rounded-lg bg-muted/50 border border-border/60 font-mono text-[11px] text-foreground">
            <span className="text-muted-foreground block text-[10px] uppercase font-sans font-medium mb-0.5">
              Calculation formula
            </span>
            {formula}
          </div>
        )}

        {tip && (
          <p className="text-[11px] text-muted-foreground/90 italic pt-1 border-t border-border/40">
            💡 {tip}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

