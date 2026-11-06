"use client";

import * as React from "react";
import {
  IconAlignLeft,
  IconCircleDot,
  IconCommand,
  IconDeviceFloppy,
  IconEye,
  IconGripVertical,
  IconMail,
  IconPlus,
  IconSparkles,
  IconStar,
} from "@tabler/icons-react";
import { QUESTION_TYPES } from "../registry/question-registry";

interface EmptyStateProps {
  onInsertField: (field: {
    type: string;
    label: string;
    placeholder?: string;
    helpText?: string;
    config?: Record<string, unknown>;
    validationRules?: Record<string, unknown>;
  }) => void;
  onFocusEditor?: () => void;
}

export function EditorEmptyState({ onInsertField, onFocusEditor }: EmptyStateProps) {
  const quickQuestions = [
    QUESTION_TYPES.short_text,
    QUESTION_TYPES.single_select,
    QUESTION_TYPES.email,
    QUESTION_TYPES.star_rating,
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 p-6 sm:p-8 my-6 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
        <IconSparkles className="size-5" />
      </div>

      <h3 className="font-semibold text-base text-foreground mb-1">
        Start building your form
      </h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
        Click below to start typing directly on the document, or press{" "}
        <kbd className="font-mono bg-muted border px-1.5 py-0.5 rounded text-foreground font-semibold text-[11px]">
          /
        </kbd>{" "}
        anywhere to insert questions and content blocks.
      </p>

      {/* 1-click popular questions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto mb-6">
        {quickQuestions.map((q) => {
          if (!q) return null;
          const Icon = q.icon;
          return (
            <button
              key={q.type}
              type="button"
              onClick={() =>
                onInsertField({
                  type: q.type,
                  label: q.defaultLabel,
                  placeholder: q.defaultPlaceholder,
                  helpText: q.defaultHelpText,
                  config: q.defaultConfig,
                  validationRules: q.defaultValidationRules,
                })
              }
              className="panel-highlight flex flex-col items-center gap-2 p-3 rounded-xl border border-border/70 bg-card hover:bg-accent/40 hover:border-foreground/30 active:scale-[0.97] transition-all text-xs group cursor-pointer shadow-2xs"
            >
              <div className="size-8 rounded-lg bg-muted/70 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Icon className="size-4" />
              </div>
              <span className="font-medium text-foreground">{q.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtle tips list */}
      <div className="pt-4 border-t border-border/60 max-w-md mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground/80">
        <span className="flex items-center gap-1">
          <IconPlus className="size-3 text-primary" />
          <span>Gutter plus to insert</span>
        </span>
        <span className="flex items-center gap-1">
          <IconGripVertical className="size-3 text-primary" />
          <span>Drag handle to reorder</span>
        </span>
        <span className="flex items-center gap-1">
          <IconEye className="size-3 text-primary" />
          <span>Preview respondent view</span>
        </span>
        <span className="flex items-center gap-1">
          <IconDeviceFloppy className="size-3 text-primary" />
          <span>Explicit Save Changes</span>
        </span>
      </div>
    </div>
  );
}
