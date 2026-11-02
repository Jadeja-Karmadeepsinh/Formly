"use client";

import * as React from "react";
import {
  IconAlignLeft,
  IconCircleDot,
  IconCommand,
  IconMail,
  IconPlus,
  IconSparkles,
  IconStar,
} from "@tabler/icons-react";
import { Button } from "~/components/ui/button";

interface EmptyStateProps {
  onInsertField: (field: {
    type: string;
    label: string;
    placeholder?: string;
    config?: Record<string, unknown>;
  }) => void;
}

export function EditorEmptyState({ onInsertField }: EmptyStateProps) {
  const quickActions = [
    {
      title: "Short Text",
      type: "short_text",
      icon: IconAlignLeft,
      placeholder: "e.g. Full Name",
      label: "What is your name?",
    },
    {
      title: "Email Address",
      type: "email",
      icon: IconMail,
      placeholder: "name@example.com",
      label: "Email Address",
    },
    {
      title: "Single Choice",
      type: "single_select",
      icon: IconCircleDot,
      label: "Which option best describes you?",
      config: {
        options: [
          { label: "Option A", value: "option_a" },
          { label: "Option B", value: "option_b" },
          { label: "Other", value: "other" },
        ],
      },
    },
    {
      title: "Star Rating",
      type: "star_rating",
      icon: IconStar,
      label: "How would you rate your experience?",
      config: { max: 5 },
    },
  ];

  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 my-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
        <IconSparkles className="size-6" />
      </div>
      <h3 className="font-semibold text-base text-foreground mb-1">
        Start building your form
      </h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
        Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">/</span> anywhere in the document to insert questions, headings, or content blocks, or pick a question below.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.type}
              type="button"
              onClick={() =>
                onInsertField({
                  type: action.type,
                  label: action.label,
                  placeholder: action.placeholder,
                  config: action.config,
                })
              }
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/40 hover:border-border transition-all text-xs group cursor-pointer"
            >
              <div className="size-8 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Icon className="size-4" />
              </div>
              <span className="font-medium text-foreground">{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

