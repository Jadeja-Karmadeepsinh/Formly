"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { ThemeToggle } from "~/components/theme-toggle";
import { isMacPlatform } from "~/lib/format-utils";

interface SiteHeaderProps {
  onOpenCommandPalette?: () => void;
}

export function SiteHeader({
  onOpenCommandPalette,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(isMacPlatform());
  }, []);

  const getBreadcrumbs = () => {
    // For Overview page (/dashboard), avoid redundant breadcrumbs
    if (pathname === "/dashboard") {
      return null;
    }

    if (pathname.startsWith("/dashboard/settings")) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Settings</span>
        </div>
      );
    }

    if (pathname.startsWith("/dashboard/analytics")) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Analytics</span>
        </div>
      );
    }

    if (pathname.startsWith("/dashboard/responses")) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Responses</span>
        </div>
      );
    }

    return null;
  };

  const breadcrumbs = getBreadcrumbs();
  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur-md transition-colors lg:px-8">
      {/* Left: Sidebar trigger + Contextual Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 size-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors" />
        {breadcrumbs && (
          <>
            <div className="h-4 w-[1px] bg-border/80" />
            {breadcrumbs}
          </>
        )}
      </div>

      {/* Right Actions: Global Search (Command Palette) & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Global Search Button Trigger (Platform-Aware) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          suppressHydrationWarning
          className="flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 text-xs text-muted-foreground transition-all hover:border-border hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-48 md:w-56 lg:w-64 justify-between cursor-pointer shadow-2xs"
          title={`Search workspace (${shortcutLabel})`}
          aria-label={`Open command palette (${shortcutLabel})`}
        >
          <span className="flex items-center gap-2">
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <span className="hidden sm:inline">Search workspace...</span>
            <span className="inline sm:hidden">Search...</span>
          </span>
          <kbd className="hidden sm:inline-flex h-4.5 select-none items-center justify-center rounded border border-border/80 bg-background/80 px-1.5 text-[10px] font-mono text-muted-foreground font-medium shrink-0">
            {shortcutLabel}
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <ThemeToggle className="size-9 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 transition-colors shadow-2xs" />
      </div>
    </header>
  );
}
