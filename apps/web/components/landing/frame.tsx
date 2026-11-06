import * as React from "react";

/**
 * Crosshair marker `+` (11px × 11px, 1.2px stroke)
 * Placed at key intersections of horizontal section lines and vertical frame lines.
 */
export function Crosshair({
  className = "",
  position = "top-left",
}: {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}) {
  const positionClasses = {
    "top-left": "-top-[5px] -left-[5.5px]",
    "top-right": "-top-[5px] -right-[5.5px]",
    "bottom-left": "-bottom-[5px] -left-[5.5px]",
    "bottom-right": "-bottom-[5px] -right-[5.5px]",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  }[position];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 size-[11px] select-none text-foreground/45 dark:text-foreground/35 ${positionClasses} ${className}`}
    >
      <svg
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full stroke-current stroke-[1.2]"
      >
        <path d="M5.5 0v11M0 5.5h11" />
      </svg>
    </div>
  );
}

/**
 * Centered PageFrame container:
 * - 1200px max width on desktop
 * - Hairline vertical borders on left and right edges running the full length
 * - Outer diagonal stripe screen-line gutters on viewports wider than 1200px
 */
export function PageFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-background">
      {/* Outer Gutter Stripes (Visible only on screens > 1200px) */}
      <div
        aria-hidden="true"
        className="gutter-stripes pointer-events-none fixed inset-y-0 left-0 hidden w-[calc((100vw-1200px)/2)] xl:block"
      />
      <div
        aria-hidden="true"
        className="gutter-stripes pointer-events-none fixed inset-y-0 right-0 hidden w-[calc((100vw-1200px)/2)] xl:block"
      />

      {/* Main 1200px Centered Frame with vertical borders */}
      <div
        className={`relative mx-auto w-full max-w-[1200px] border-x border-border/80 bg-background ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Standard Section with horizontal divider and optional corner crosshairs
 */
export function Section({
  id,
  className = "",
  children,
  crosshairs = false,
  noBorderBottom = false,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  crosshairs?: boolean;
  noBorderBottom?: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative w-full ${!noBorderBottom ? "border-b border-border/80" : ""} ${className}`}
    >
      {crosshairs && (
        <>
          <Crosshair position="top-left" />
          <Crosshair position="top-right" />
        </>
      )}
      {children}
    </section>
  );
}

/**
 * Consistent Section Header Lockup:
 * - Eyebrow in mono uppercase with index (e.g. "01 / FEATURES")
 * - Tight-tracked H2
 * - One-sentence muted body description (max ~58ch)
 */
export function SectionHeader({
  eyebrow,
  index,
  title,
  description,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  index?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const isCenter = align === "center";

  return (
    <div
      className={`space-y-3 ${isCenter ? "mx-auto text-center items-center" : "text-left"} ${className}`}
    >
      {eyebrow && (
        <div
          className={`flex items-center gap-2 font-mono text-[11px] font-medium tracking-widest text-muted-foreground uppercase ${isCenter ? "justify-center" : ""}`}
        >
          {index && (
            <span className="text-foreground/80 font-semibold">{index}</span>
          )}
          {index && <span className="opacity-40">/</span>}
          <span>{eyebrow}</span>
        </div>
      )}

      <h2
        className={`text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl text-balance ${isCenter ? "mx-auto" : ""}`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[58ch] ${isCenter ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Keyboard Key Chip
 */
export function Kbd({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono text-[10px] font-medium px-1.5 py-0.5 rounded border border-border/80 bg-muted/60 text-muted-foreground shadow-2xs select-none ${className}`}
    >
      {children}
    </kbd>
  );
}

/**
 * Announcement / Meta Pill
 */
export function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xs ${className}`}
    >
      {children}
    </div>
  );
}

