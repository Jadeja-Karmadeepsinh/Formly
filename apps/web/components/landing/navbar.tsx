"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import { FormlyLogo } from "~/components/formly-logo";
import { ThemeToggle } from "~/components/theme-toggle";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Product Tour", href: "#showcase" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
] as const;

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo Lockup */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          aria-label="Formly homepage"
        >
          <FormlyLogo size={24} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-7 text-[13px] font-medium text-muted-foreground md:flex"
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

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-[13px] font-medium h-9 px-3.5">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="text-[13px] font-medium h-9 px-4 gap-1.5 shadow-xs">
              Get started
              <ArrowRight className="size-3.5 opacity-80" />
            </Button>
          </Link>
        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="size-9"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div
          className="border-b border-border bg-background px-4 py-6 md:hidden animate-in fade-in-0 slide-in-from-top-2 duration-150"
          role="dialog"
          aria-label="Mobile Navigation Menu"
        >
          <nav className="flex flex-col space-y-3.5 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 border-t border-border/60 pt-4 flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center gap-1.5">
                  Get started
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

