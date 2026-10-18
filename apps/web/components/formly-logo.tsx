import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * Authentic Formly brand symbol:
 * Abstract geometric mark inspired by folded/layered form sheets,
 * as specified in Section 2 of ui.md.
 */
export function FormlySymbol({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Base sheet */}
      <rect
        x="3"
        y="5"
        width="14"
        height="16"
        rx="2"
        className="fill-foreground/15 stroke-foreground"
        strokeWidth="1.5"
      />
      {/* Front layered sheet */}
      <rect
        x="7"
        y="3"
        width="14"
        height="16"
        rx="2"
        className="fill-background stroke-foreground"
        strokeWidth="1.5"
      />
      {/* Accent form lines */}
      <line
        x1="10.5"
        y1="8"
        x2="17.5"
        y2="8"
        className="stroke-foreground"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="10.5"
        y1="11.5"
        x2="15.5"
        y2="11.5"
        className="stroke-foreground/60"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Formly Logo Lockup:
 * Combines the geometric mark with the refined wordmark.
 */
export function FormlyLogo({
  className,
  size = 22,
  showWordmark = true,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      <FormlySymbol size={size} />
      {showWordmark && (
        <span className="font-semibold tracking-[-0.02em] text-foreground text-lg leading-none">
          Formly
        </span>
      )}
    </div>
  );
}
