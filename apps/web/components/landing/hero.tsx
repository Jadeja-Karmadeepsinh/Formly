"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Crosshair, Kbd, Pill } from "./frame";
import { HeroInteractivePreview } from "./interactive-preview";

export function LandingHero() {
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard?.writeText("formly.app/new");
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
      {/* Corner Crosshairs */}
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* Hero Inner Container */}
      <div className="px-4 sm:px-8 text-center max-w-5xl mx-auto">
        {/* Paper-style Announcement Pill */}
        <div className="flex justify-center mb-6">
          <Pill>
            <span className="size-1.5 rounded-full bg-foreground" />
            <span className="font-mono text-[11px] font-semibold text-foreground tracking-wider uppercase">
              Formly Engine v2.0
            </span>
            <span className="opacity-30">|</span>
            <span className="text-muted-foreground text-xs">
              Document-first forms with immutable snapshots
            </span>
            <ArrowRight className="size-3 opacity-60 ml-0.5" />
          </Pill>
        </div>

        {/* Hero Title: Tight tracked H1 */}
        <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-[72px] leading-[1.04] text-foreground text-balance">
          Forms that feel like writing a document.
        </h1>

        {/* Sub-copy: Clear, honest product intent */}
        <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[58ch] mx-auto text-pretty">
          Type inline, insert blocks with slash commands, and capture responses with zero friction.
          Every version is an immutable snapshot that protects live data.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button
              size="lg"
              className="h-10 px-5 text-sm font-medium gap-2 shadow-xs active:scale-[0.98] transition-all"
            >
              Start building, it&apos;s free
              <ArrowRight className="size-4 opacity-80" />
            </Button>
          </Link>

          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="h-10 px-5 text-sm font-medium border-border/80 active:scale-[0.98] transition-all"
            >
              Explore capabilities
            </Button>
          </a>
        </div>

        {/* React Wheel Picker style copyable command / prompt pill */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3.5 py-1 font-mono text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:bg-muted/60"
            title="Click to copy quickstart link"
          >
            <span className="text-foreground/60 font-semibold">$</span>
            <span className="text-foreground">formly.app/new</span>
            <span className="opacity-30">•</span>
            <span className="text-[11px] text-muted-foreground/80">
              press <Kbd className="text-[9px] py-0 px-1 mx-0.5">/</Kbd> to insert blocks
            </span>
            {copiedPrompt ? (
              <Check className="size-3 text-emerald-500 ml-1" />
            ) : (
              <Copy className="size-3 opacity-50 group-hover:opacity-100 ml-1 transition-opacity" />
            )}
          </button>
        </div>

        {/* Hero Product Visual Demo */}
        <div className="mt-12 sm:mt-16">
          <HeroInteractivePreview />
        </div>
      </div>
    </div>
  );
}
