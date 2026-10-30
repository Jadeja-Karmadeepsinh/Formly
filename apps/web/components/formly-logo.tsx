import * as React from "react";
import { cn } from "~/lib/utils";

export interface FormlySymbolProps extends React.ComponentProps<"svg"> {
  size?: number | string;
}

/**
 * Official Formly Brand Symbol / Mark:
 * Abstract dynamic geometric mark with upper outer wing and lower slanted block.
 * Uses fill="currentColor" to automatically adapt to light and dark themes.
 */
export function FormlySymbol({
  className,
  size = 20,
  ...props
}: FormlySymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden={props["aria-label"] ? undefined : "true"}
      {...props}
    >
      {/* Upper outer wing & left stem */}
      <path d="M 14 55 C 14 45.1 21.52 33.99 30.71 30.31 L 81.04 10.18 C 85.22 8.51 88 10.4 88 14.9 L 88 26.5 C 88 31.18 84.45 36.42 80.11 38.16 L 37.5 55.2 C 30.35 58.06 24.5 66.7 24.5 74.4 L 24.5 80.5 C 24.5 82.0 23.2 82.6 21.8 81.8 C 17.0 79.0 14 75.8 14 71.5 Z" />
      {/* Lower inner slanted block */}
      <path d="M 32 74.5 C 32 69.28 35.97 63.41 40.82 61.47 L 78.0 46.6 C 81.9 45.04 84.5 46.8 84.5 51.0 L 84.5 63.0 C 84.5 67.68 80.95 72.92 76.61 74.66 L 35.25 91.2 C 33.3 91.98 32 91.1 32 89.0 Z" />
    </svg>
  );
}

export interface FormlyWordmarkProps extends React.ComponentProps<"svg"> {
  size?: number | string;
}

/**
 * Official Formly Vector Wordmark ("Formly"):
 * High-precision vector typography curves with zero font-dependency.
 */
export function FormlyWordmark({
  className,
  size = 20,
  ...props
}: FormlyWordmarkProps) {
  // Original width from x=114 to x=320.5 is 206.5, height ~58
  const numericSize = typeof size === "number" ? size : 20;
  return (
    <svg
      height={size}
      width={numericSize * 3.56}
      viewBox="114 25 210 59"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden={props["aria-label"] ? undefined : "true"}
      {...props}
    >
      <g id="formly-wordmark">
        {/* F */}
        <path d="M 114 26 H 143 V 34 H 123 V 44.5 H 139 V 52.5 H 123 V 70 H 114 Z" />
        {/* o */}
        <path d="M 163.5 36.2 C 173.5 36.2 180.5 43.3 180.5 53.5 C 180.5 63.7 173.5 70.8 163.5 70.8 C 153.5 70.8 146.5 63.7 146.5 53.5 C 146.5 43.3 153.5 36.2 163.5 36.2 Z M 163.5 43.8 C 158.3 43.8 155.3 47.7 155.3 53.5 C 155.3 59.3 158.3 63.2 163.5 63.2 C 168.7 63.2 171.7 59.3 171.7 53.5 C 171.7 47.7 168.7 43.8 163.5 43.8 Z" />
        {/* r */}
        <path d="M 187.5 37 H 195.8 V 42.6 C 197.8 38.4 201.5 36.4 206.2 36.4 C 206.8 36.4 207.4 36.5 207.8 36.6 V 45.2 C 207.0 45.0 205.9 44.9 204.8 44.9 C 199.3 44.9 196.3 48.0 196.3 54.2 V 70 H 187.5 Z" />
        {/* m */}
        <path d="M 213.5 37 H 221.8 V 41.8 C 223.9 38.1 227.6 36.2 232.2 36.2 C 236.9 36.2 240.3 38.3 241.9 42.4 C 244.3 38.2 248.3 36.2 253.2 36.2 C 259.6 36.2 263.8 40.4 263.8 48.0 V 70 H 255.0 V 49.4 C 255.0 45.4 253.0 43.5 249.5 43.5 C 245.8 43.5 243.0 46.1 243.0 50.2 V 70 H 234.2 V 49.4 C 234.2 45.4 232.2 43.5 228.7 43.5 C 225.0 43.5 222.3 46.1 222.3 50.2 V 70 H 213.5 Z" />
        {/* l */}
        <path d="M 271.5 25 H 280.3 V 70 H 271.5 Z" />
        {/* y */}
        <path d="M 285.5 37 H 294.8 L 303.2 59.5 L 311.4 37 H 320.5 L 302.2 83 H 293.0 L 298.6 69.2 Z" />
      </g>
    </svg>
  );
}

export interface FormlyLogoProps extends React.ComponentProps<"svg"> {
  size?: number;
  showWordmark?: boolean;
  variant?: "vector" | "mark";
}

/**
 * Official Formly Brand Logo Lockup:
 * Combines the icon mark with the precision vector wordmark (aspect ratio 3.36:1).
 * Uses fill="currentColor" to align with dark and light themes automatically.
 */
export function FormlyLogo({
  className,
  size = 24,
  showWordmark = true,
  variant = "vector",
  ...props
}: FormlyLogoProps) {
  if (!showWordmark || variant === "mark") {
    return (
      <FormlySymbol
        size={size}
        className={cn("text-foreground", className)}
        {...props}
      />
    );
  }

  // 336x100 aspect ratio = 3.36:1
  const width = Math.round(size * 3.36);

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 336 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Formly"
      className={cn("shrink-0 text-foreground select-none", className)}
      {...props}
    >
      {/* Icon Mark */}
      <g id="formly-mark">
        <path d="M 14 55 C 14 45.1 21.52 33.99 30.71 30.31 L 81.04 10.18 C 85.22 8.51 88 10.4 88 14.9 L 88 26.5 C 88 31.18 84.45 36.42 80.11 38.16 L 37.5 55.2 C 30.35 58.06 24.5 66.7 24.5 74.4 L 24.5 80.5 C 24.5 82.0 23.2 82.6 21.8 81.8 C 17.0 79.0 14 75.8 14 71.5 Z" />
        <path d="M 32 74.5 C 32 69.28 35.97 63.41 40.82 61.47 L 78.0 46.6 C 81.9 45.04 84.5 46.8 84.5 51.0 L 84.5 63.0 C 84.5 67.68 80.95 72.92 76.61 74.66 L 35.25 91.2 C 33.3 91.98 32 91.1 32 89.0 Z" />
      </g>

      {/* Vector Wordmark ("Formly") */}
      <g id="formly-wordmark">
        {/* F */}
        <path d="M 114 26 H 143 V 34 H 123 V 44.5 H 139 V 52.5 H 123 V 70 H 114 Z" />
        {/* o */}
        <path d="M 163.5 36.2 C 173.5 36.2 180.5 43.3 180.5 53.5 C 180.5 63.7 173.5 70.8 163.5 70.8 C 153.5 70.8 146.5 63.7 146.5 53.5 C 146.5 43.3 153.5 36.2 163.5 36.2 Z M 163.5 43.8 C 158.3 43.8 155.3 47.7 155.3 53.5 C 155.3 59.3 158.3 63.2 163.5 63.2 C 168.7 63.2 171.7 59.3 171.7 53.5 C 171.7 47.7 168.7 43.8 163.5 43.8 Z" />
        {/* r */}
        <path d="M 187.5 37 H 195.8 V 42.6 C 197.8 38.4 201.5 36.4 206.2 36.4 C 206.8 36.4 207.4 36.5 207.8 36.6 V 45.2 C 207.0 45.0 205.9 44.9 204.8 44.9 C 199.3 44.9 196.3 48.0 196.3 54.2 V 70 H 187.5 Z" />
        {/* m */}
        <path d="M 213.5 37 H 221.8 V 41.8 C 223.9 38.1 227.6 36.2 232.2 36.2 C 236.9 36.2 240.3 38.3 241.9 42.4 C 244.3 38.2 248.3 36.2 253.2 36.2 C 259.6 36.2 263.8 40.4 263.8 48.0 V 70 H 255.0 V 49.4 C 255.0 45.4 253.0 43.5 249.5 43.5 C 245.8 43.5 243.0 46.1 243.0 50.2 V 70 H 234.2 V 49.4 C 234.2 45.4 232.2 43.5 228.7 43.5 C 225.0 43.5 222.3 46.1 222.3 50.2 V 70 H 213.5 Z" />
        {/* l */}
        <path d="M 271.5 25 H 280.3 V 70 H 271.5 Z" />
        {/* y */}
        <path d="M 285.5 37 H 294.8 L 303.2 59.5 L 311.4 37 H 320.5 L 302.2 83 H 293.0 L 298.6 69.2 Z" />
      </g>
    </svg>
  );
}

export interface FormlyBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  symbolSize?: number;
}

/**
 * Formly Brand Squircle Badge:
 * High-contrast container inspired by favicon.svg:
 * In light mode: dark rounded box with light symbol.
 * In dark mode: light rounded box with dark symbol (or primary background).
 */
export function FormlyBadge({
  className,
  size = "md",
  symbolSize,
  ...props
}: FormlyBadgeProps) {
  const sizeClasses = {
    sm: "size-7 rounded-md",
    md: "size-8 rounded-lg",
    lg: "size-10 rounded-xl",
    xl: "size-12 rounded-2xl",
  }[size];

  const defaultSymbolSizes = {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 26,
  }[size];

  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center shrink-0 shadow-xs select-none",
        "bg-[#111317] text-[#F9FAFB] dark:bg-[#F9FAFB] dark:text-[#111317]",
        sizeClasses,
        className
      )}
      {...props}
    >
      <FormlySymbol size={symbolSize ?? defaultSymbolSizes} />
    </div>
  );
}
