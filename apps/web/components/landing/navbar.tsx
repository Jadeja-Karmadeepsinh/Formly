"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Menu, X, ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import { FormlyLogo } from "~/components/formly-logo";
import { ThemeToggle } from "~/components/theme-toggle";
import { Kbd } from "./frame";
import { LandingCommandMenu } from "./command-dialog";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Builder", href: "#builder-deep-dive" },
  { label: "Workflow", href: "#workflow" },
  { label: "Use Cases", href: "#templates" },
  { label: "Comparison", href: "#comparison" },
  { label: "FAQ", href: "#faq" },
] as const;

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  // Close mobile menu on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
        <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-transform duration-200 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            aria-label="Formly homepage"
          >
            <FormlyLogo size={22} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden items-center gap-6 text-[13px] font-medium text-muted-foreground lg:flex"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="hidden items-center gap-2.5 sm:flex">
            {/* ⌘K Search / Command Trigger */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex h-8 items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-2.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search and quick actions"
            >
              <Search className="size-3.5 opacity-70" />
              <span className="font-normal">Search...</span>
              <Kbd className="ml-1 text-[10px] py-0 px-1">⌘K</Kbd>
            </button>

            <ThemeToggle />

            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all"
              >
                Sign in
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                size="sm"
                className="h-8 px-3.5 text-[13px] font-medium gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
              >
                Start for free
                <ArrowRight className="size-3.5 opacity-80" />
              </Button>
            </Link>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex size-8 items-center justify-center rounded-md border border-border/80 text-muted-foreground hover:text-foreground"
              aria-label="Open command palette"
            >
              <Search className="size-3.5" />
            </button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="size-8"
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div
            className="border-t border-border/80 bg-background px-4 py-5 sm:hidden"
            role="dialog"
            aria-label="Mobile Navigation Menu"
          >
            <nav className="flex flex-col space-y-1 text-sm font-medium">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border/80">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center h-9 text-xs">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center h-9 text-xs">
                    Start for free
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ⌘K Command Palette Modal */}
      <LandingCommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
