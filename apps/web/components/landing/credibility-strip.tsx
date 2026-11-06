import * as React from "react";

const STANDARDS = [
  { name: "Next.js App Router", label: "SSR & Streaming" },
  { name: "React 19", label: "Server Components" },
  { name: "TypeScript 5", label: "End-to-End Type Safety" },
  { name: "PostgreSQL & Drizzle", label: "Relational Integrity" },
  { name: "Tiptap Engine", label: "Document-First Schema" },
  { name: "Tailwind CSS 4", label: "Zero-Runtime Tokens" },
];

export function LandingCredibilityStrip() {
  return (
    <div className="w-full">
      {/* Eyebrow Label */}
      <div className="px-4 sm:px-8 py-3 bg-muted/20 border-b border-border/80 flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Architecture & Standards
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/60 hidden sm:inline">
          Sub-50ms render latency · Zero bloat
        </span>
      </div>

      {/* 6-Column Lined Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-border/80 text-center">
        {STANDARDS.map((item, idx) => (
          <div
            key={idx}
            className="group flex flex-col justify-center px-4 py-4 sm:py-5 transition-colors hover:bg-muted/30"
          >
            <span className="font-semibold text-xs sm:text-sm text-foreground/90 transition-colors group-hover:text-foreground">
              {item.name}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

