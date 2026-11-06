import * as React from "react";
import Link from "next/link";
import { FormlyLogo } from "~/components/formly-logo";
import { ThemeToggle } from "~/components/theme-toggle";
import { Crosshair } from "./frame";

export function LandingFooter() {
  return (
    <footer className="relative w-full bg-background text-foreground">
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* Main Footer Grid: 4 columns divided by vertical hairlines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/80 border-b border-border/80">
        {/* Brand Column */}
        <div className="p-6 sm:p-8 space-y-4">
          <Link href="/" className="inline-block" aria-label="Formly Homepage">
            <FormlyLogo size={22} />
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The document-first SaaS form builder. Type questions freely, freeze immutable snapshots, and collect responses with absolute integrity.
          </p>
          <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
        </div>

        {/* Product Column */}
        <div className="p-6 sm:p-8 space-y-3">
          <div className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            PRODUCT
          </div>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li>
              <a href="#features" className="hover:text-foreground transition-colors">
                Core Capabilities
              </a>
            </li>
            <li>
              <a href="#builder-deep-dive" className="hover:text-foreground transition-colors">
                Document-First Builder
              </a>
            </li>
            <li>
              <a href="#workflow" className="hover:text-foreground transition-colors">
                Publishing Workflow
              </a>
            </li>
            <li>
              <a href="#templates" className="hover:text-foreground transition-colors">
                Use Cases & Patterns
              </a>
            </li>
            <li>
              <a href="#comparison" className="hover:text-foreground transition-colors">
                Architectural Comparison
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-foreground transition-colors">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Account & Platform Column */}
        <div className="p-6 sm:p-8 space-y-3">
          <div className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            ACCOUNT
          </div>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Sign in to Dashboard
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-foreground transition-colors">
                Create Free Account
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Forms Overview
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Standards Column */}
        <div className="p-6 sm:p-8 space-y-3">
          <div className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            STANDARDS & PRIVACY
          </div>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li>
              <span className="text-foreground/80">Privacy-First Architecture</span>
            </li>
            <li>
              <span className="text-foreground/80">Cryptographic Version Snapshots</span>
            </li>
            <li>
              <span className="text-foreground/80">Zero Third-Party Ad Trackers</span>
            </li>
            <li>
              <span className="text-foreground/80">Relational Data Model</span>
            </li>
          </ul>

          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Switch theme:</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-muted-foreground">
        <div>
          &copy; {new Date().getFullYear()} Formly Inc. All rights reserved.
        </div>
        <div className="flex items-center gap-3">
          <span>Engineered with precision</span>
          <span className="opacity-30">•</span>
          <span>Hanken Grotesk</span>
        </div>
      </div>
    </footer>
  );
}
