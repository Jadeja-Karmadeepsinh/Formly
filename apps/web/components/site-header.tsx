"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";

interface SiteHeaderProps {
  onOpenCreateForm?: () => void;
  onOpenCommandPalette?: () => void;
}

export function SiteHeader({
  onOpenCreateForm,
  onOpenCommandPalette,
}: SiteHeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    if (pathname.startsWith("/dashboard/settings")) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Workspace
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
            Workspace
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
            Workspace
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Responses</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">Workspace</span>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <span className="font-medium text-foreground">Overview</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md transition-colors lg:px-6">
      {/* Left: Sidebar trigger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <div className="h-4 w-[1px] bg-border/80" />
        {getBreadcrumbs()}
      </div>

      {/* Middle & Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          suppressHydrationWarning
          className="flex h-8 items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 text-xs text-muted-foreground transition-all hover:border-border hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-36 md:w-44 lg:w-56 justify-between cursor-pointer"
          title="Open Command Palette (⌘K)"
        >
          <span className="flex items-center gap-1.5">
            <Search className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Search forms...</span>
            <span className="inline sm:hidden">Search...</span>
          </span>
          <kbd className="hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* New Form Button */}
        <Button
          size="sm"
          onClick={onOpenCreateForm}
          className="h-8 gap-1.5 rounded-lg text-xs font-medium px-3 shadow-xs active:scale-[0.98] transition-all"
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">New Form</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle className="size-8 rounded-lg" />
      </div>
    </header>
  );
}
