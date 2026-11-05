"use client";

import * as React from "react";
import Link from "next/link";

import { FormlyLogo } from "~/components/formly-logo";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background py-14 sm:py-18">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 pb-12 border-b border-border/50">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3.5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
              aria-label="Formly homepage"
            >
              <FormlyLogo size={22} />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              A document-first SaaS form builder designed for flow, speed, and strict relational response integrity.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground font-mono">
                Engine: Active & Operational
              </span>
            </div>
          </div>

          {/* Links Column 1: Product Navigation */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground block">
              Product
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features & Elements
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-foreground transition-colors">
                  Product Architecture
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#use-cases" className="hover:text-foreground transition-colors">
                  Practical Use Cases
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Account & Workspace */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground block">
              Account
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" prefetch={false} className="hover:text-foreground transition-colors">
                  Form Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Legal & Privacy */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground block">
              Legal
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
          <p>© {currentYear} Formly. All rights reserved.</p>
          <p className="font-mono text-[11px]">
            Document-first form engine · Designed with care
          </p>
        </div>
      </div>
    </footer>
  );
}

