"use client";

import * as React from "react";
import {
  ArrowRight,
  Calendar,
  MessageSquare,
  Plus,
  Star,
} from "lucide-react";
import { FormlySymbol } from "~/components/formly-logo";
import { Button } from "~/components/ui/button";

interface EmptyFormsStateProps {
  onCreateForm: () => void;
  onSelectStarter?: (title: string, description: string) => void;
}

export function EmptyFormsState({
  onCreateForm,
  onSelectStarter,
}: EmptyFormsStateProps) {
  const starterTemplates = [
    {
      title: "Customer Feedback Survey",
      description: "Measure customer satisfaction, rating scales, and feature requests.",
      icon: Star,
    },
    {
      title: "Event RSVP & Registration",
      description: "Gather guest information, attendance headcount, and dietary preferences.",
      icon: Calendar,
    },
    {
      title: "Contact & General Inquiry",
      description: "Collect client questions, contact emails, and feedback directly.",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 text-center">
      {/* Brand Icon Badge */}
      <div className="flex size-14 items-center justify-center rounded-xl bg-foreground text-background shadow-xs mb-4">
        <FormlySymbol size={28} />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        Create your first form
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Build questions, publish a public link, and start collecting structured responses with real-time analytics.
      </p>

      {/* Main CTA */}
      <Button
        size="lg"
        onClick={onCreateForm}
        className="mt-6 gap-2 rounded-xl text-sm font-medium px-5 h-10 shadow-xs"
      >
        <Plus className="size-4" />
        <span>Create New Form</span>
        <kbd className="ml-1 inline-flex h-4 select-none items-center rounded border border-primary-foreground/30 px-1 text-[10px] font-mono opacity-80">
          C
        </kbd>
      </Button>

      {/* Quick-Start Starters */}
      <div className="mt-12 w-full max-w-2xl text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick-start with an idea
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {starterTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.title}
                type="button"
                onClick={() => {
                  if (onSelectStarter) {
                    onSelectStarter(template.title, template.description);
                  } else {
                    onCreateForm();
                  }
                }}
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-border hover:bg-card/90 hover:shadow-2xs cursor-pointer"
              >
                <div>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {template.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Use template</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
