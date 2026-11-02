"use client";

import * as React from "react";
import {
  mergeAttributes,
  Node,
} from "@tiptap/core";
import {
  NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import {
  IconCalendar,
  IconClock,
  IconChevronDown,
  IconGripVertical,
  IconHash,
  IconLink,
  IconMail,
  IconPhone,
  IconPlus,
  IconSettings,
  IconStar,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { getQuestionTypeDefinition } from "../registry/question-registry";

function FormFieldNodeView({
  node,
  updateAttributes,
  deleteNode,
  editor,
  selected,
}: NodeViewProps) {
  const {
    fieldId,
    type,
    label,
    placeholder,
    helpText,
    required,
    config,
    validationRules,
  } = node.attrs;

  const qDef = getQuestionTypeDefinition(type);
  const Icon = qDef.icon;

  const [isEditingDescription, setIsEditingDescription] = React.useState(
    Boolean(helpText)
  );

  // Notify parent of field selection to update Contextual Properties Panel
  const handleSelectField = React.useCallback(() => {
    const onSelectField = (
      editor?.storage as {
        formly?: {
          onSelectField?: (field: {
            fieldId: string;
            type: string;
            label: string;
            placeholder?: string | null;
            helpText?: string | null;
            required: boolean;
            config: Record<string, unknown>;
            validationRules: Record<string, unknown>;
          }) => void;
        };
      }
    )?.formly?.onSelectField;

    if (typeof onSelectField === "function" && fieldId) {
      onSelectField({
        fieldId,
        type,
        label,
        placeholder,
        helpText,
        required,
        config: config || {},
        validationRules: validationRules || {},
      });
    }
  }, [editor, fieldId, type, label, placeholder, helpText, required, config, validationRules]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const onFieldDeleted = (
      editor?.storage as {
        formly?: {
          onFieldDeleted?: (id: string) => void;
        };
      }
    )?.formly?.onFieldDeleted;

    if (typeof onFieldDeleted === "function" && fieldId) {
      onFieldDeleted(fieldId);
    }
    deleteNode();
  };

  // Choice Options Helpers for inline editing
  const rawOptions: Array<{ label: string; value: string }> = Array.isArray(
    config?.options
  )
    ? (config.options as Array<{ label: string; value: string }>)
    : [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ];

  const handleUpdateOption = (idx: number, newLabel: string) => {
    const next = [...rawOptions];
    const item = next[idx];
    if (item) {
      next[idx] = {
        ...item,
        label: newLabel,
        value: item.value || newLabel.toLowerCase().replace(/\s+/g, "_"),
      };
      updateAttributes({
        config: { ...config, options: next },
      });
      handleSelectField();
    }
  };

  const handleAddOption = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = rawOptions.length + 1;
    const next = [
      ...rawOptions,
      { label: `Option ${nextIdx}`, value: `option_${nextIdx}` },
    ];
    updateAttributes({
      config: { ...config, options: next },
    });
    handleSelectField();
  };

  const handleRemoveOption = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (rawOptions.length <= 1) return;
    const next = rawOptions.filter((_, i) => i !== idx);
    updateAttributes({
      config: { ...config, options: next },
    });
    handleSelectField();
  };

  // Render question answer preview
  const renderFieldPreview = () => {
    switch (type) {
      case "short_text":
        return (
          <div className="pt-1">
            <Input
              disabled
              placeholder={placeholder || "Short answer text"}
              className="bg-muted/20 border-dashed text-muted-foreground/80 cursor-not-allowed max-w-md h-9 text-xs"
            />
          </div>
        );

      case "long_text":
        return (
          <div className="pt-1">
            <Textarea
              disabled
              placeholder={placeholder || "Long answer text..."}
              rows={typeof config?.rows === "number" ? config.rows : 3}
              className="bg-muted/20 border-dashed text-muted-foreground/80 cursor-not-allowed resize-none text-xs"
            />
          </div>
        );

      case "email":
        return (
          <div className="relative max-w-md pt-1">
            <IconMail className="size-4 absolute left-3 top-3.5 text-muted-foreground/50" />
            <Input
              disabled
              placeholder={placeholder || "name@example.com"}
              className="pl-9 bg-muted/20 border-dashed text-muted-foreground/80 cursor-not-allowed h-9 text-xs"
            />
          </div>
        );

      case "phone":
        return (
          <div className="relative max-w-xs pt-1">
            <IconPhone className="size-4 absolute left-3 top-3.5 text-muted-foreground/50" />
            <Input
              disabled
              placeholder={placeholder || "+1 (555) 000-0000"}
              className="pl-9 bg-muted/20 border-dashed text-muted-foreground/80 cursor-not-allowed h-9 text-xs"
            />
          </div>
        );

      case "website_url":
        return (
          <div className="relative max-w-md pt-1">
            <IconLink className="size-4 absolute left-3 top-3.5 text-muted-foreground/50" />
            <Input
              disabled
              placeholder={placeholder || "https://example.com"}
              className="pl-9 bg-muted/20 border-dashed text-muted-foreground/80 cursor-not-allowed h-9 text-xs"
            />
          </div>
        );

      case "number":
        return (
          <div className="relative w-48 pt-1">
            <IconHash className="size-4 absolute left-3 top-3.5 text-muted-foreground/50" />
            <Input
              type="number"
              disabled
              placeholder={placeholder || "0"}
              className="pl-9 bg-muted/20 border-dashed text-muted-foreground/80 cursor-not-allowed h-9 text-xs"
            />
          </div>
        );

      case "date":
        return (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg bg-muted/20 text-muted-foreground/70 text-xs w-48 cursor-not-allowed mt-1">
            <IconCalendar className="size-4" />
            <span>Select a date...</span>
          </div>
        );

      case "time":
        return (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg bg-muted/20 text-muted-foreground/70 text-xs w-36 cursor-not-allowed mt-1">
            <IconClock className="size-4" />
            <span>--:-- --</span>
          </div>
        );

      case "single_select":
        return (
          <div className="space-y-1.5 pt-1">
            {rawOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2.5 group/opt">
                <div className="size-4 rounded-full border border-muted-foreground/40 shrink-0" />
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleUpdateOption(i, e.target.value)}
                  className="bg-transparent border-none outline-none focus:outline-none text-xs text-foreground placeholder:text-muted-foreground/50 flex-1 py-0.5"
                  placeholder={`Option ${i + 1}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {rawOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(e, i)}
                    className="opacity-0 group-hover/opt:opacity-100 size-5 flex items-center justify-center text-muted-foreground/60 hover:text-destructive rounded transition-opacity"
                    title="Remove option"
                  >
                    <IconX className="size-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary pt-1 cursor-pointer transition-colors"
            >
              <IconPlus className="size-3.5" />
              <span>Add option</span>
            </button>
          </div>
        );

      case "multi_select":
        return (
          <div className="space-y-1.5 pt-1">
            {rawOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2.5 group/opt">
                <div className="size-4 rounded-sm border border-muted-foreground/40 shrink-0" />
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleUpdateOption(i, e.target.value)}
                  className="bg-transparent border-none outline-none focus:outline-none text-xs text-foreground placeholder:text-muted-foreground/50 flex-1 py-0.5"
                  placeholder={`Option ${i + 1}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {rawOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(e, i)}
                    className="opacity-0 group-hover/opt:opacity-100 size-5 flex items-center justify-center text-muted-foreground/60 hover:text-destructive rounded transition-opacity"
                    title="Remove option"
                  >
                    <IconX className="size-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary pt-1 cursor-pointer transition-colors"
            >
              <IconPlus className="size-3.5" />
              <span>Add option</span>
            </button>
          </div>
        );

      case "dropdown":
        return (
          <div className="space-y-2 pt-1 max-w-xs">
            <div className="flex items-center justify-between px-3 py-2 border border-dashed rounded-lg bg-muted/20 text-muted-foreground/70 text-xs cursor-not-allowed">
              <span>{rawOptions[0]?.label || "Choose an option..."}</span>
              <IconChevronDown className="size-4" />
            </div>
            <div className="text-[11px] text-muted-foreground pl-1">
              {rawOptions.length} choices configured
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <div className="size-4 rounded-sm border border-muted-foreground/50 shrink-0" />
            <input
              type="text"
              value={placeholder || ""}
              onChange={(e) =>
                updateAttributes({ placeholder: e.target.value })
              }
              placeholder="I agree to the terms and conditions"
              className="bg-transparent border-none outline-none focus:outline-none text-xs text-foreground placeholder:text-muted-foreground/50 flex-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );

      case "star_rating": {
        const maxStars = typeof config?.max === "number" ? config.max : 5;
        return (
          <div className="flex items-center gap-1.5 py-1">
            {Array.from({ length: maxStars }).map((_, i) => (
              <IconStar
                key={i}
                className="size-5 text-muted-foreground/30 hover:text-amber-400 transition-colors"
              />
            ))}
          </div>
        );
      }

      case "linear_rating": {
        const maxScore = typeof config?.max === "number" ? config.max : 10;
        return (
          <div className="space-y-1.5 py-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {Array.from({ length: maxScore }).map((_, i) => (
                <div
                  key={i}
                  className="size-8 rounded-lg border border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground bg-muted/20 font-medium"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            {(config?.minLabel || config?.maxLabel) && (
              <div className="flex justify-between text-[11px] text-muted-foreground max-w-sm pt-0.5">
                <span>{typeof config?.minLabel === "string" ? config.minLabel : ""}</span>
                <span>{typeof config?.maxLabel === "string" ? config.maxLabel : ""}</span>
              </div>
            )}
          </div>
        );
      }

      case "ranking":
        return (
          <div className="space-y-1.5 pt-1 max-w-sm">
            {rawOptions.map((opt, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border/70 bg-card text-xs text-foreground group/opt"
              >
                <span className="font-semibold text-muted-foreground">{i + 1}.</span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleUpdateOption(i, e.target.value)}
                  className="bg-transparent border-none outline-none focus:outline-none text-xs text-foreground placeholder:text-muted-foreground/50 flex-1"
                  placeholder={`Choice ${i + 1}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {rawOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(e, i)}
                    className="opacity-0 group-hover/opt:opacity-100 size-5 flex items-center justify-center text-muted-foreground/60 hover:text-destructive rounded transition-opacity"
                    title="Remove item"
                  >
                    <IconX className="size-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary pt-1 cursor-pointer transition-colors"
            >
              <IconPlus className="size-3.5" />
              <span>Add choice</span>
            </button>
          </div>
        );

      default:
        return (
          <Input
            disabled
            placeholder={placeholder || "Input preview"}
            className="bg-muted/20 border-dashed cursor-not-allowed max-w-md h-9 text-xs"
          />
        );
    }
  };

  return (
    <NodeViewWrapper
      onClick={handleSelectField}
      data-type="form-field"
      className={`my-4 py-3 px-4 rounded-xl transition-all duration-150 relative group/field ${
        selected
          ? "bg-accent/30 ring-1 ring-primary/40 shadow-2xs"
          : "hover:bg-accent/15"
      }`}
    >
      {/* Field Header / Question Title */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {/* Inline Editable Question Title */}
            <input
              type="text"
              value={label || ""}
              onChange={(e) => {
                updateAttributes({ label: e.target.value });
                handleSelectField();
              }}
              placeholder="Type your question..."
              className="w-full font-medium text-sm text-foreground bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground/40 py-0.5"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectField();
              }}
            />
            {required && (
              <span className="text-destructive font-bold text-xs" title="Required question">
                *
              </span>
            )}
          </div>

          {/* Inline Editable or Toggleable Description */}
          {isEditingDescription || helpText ? (
            <input
              type="text"
              value={helpText || ""}
              onChange={(e) => {
                updateAttributes({ helpText: e.target.value });
                handleSelectField();
              }}
              placeholder="Add an optional description or help text..."
              className="w-full text-xs text-muted-foreground bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground/40 mt-0.5 py-0.5"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectField();
              }}
            />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingDescription(true);
              }}
              className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors opacity-0 group-hover/field:opacity-100 text-left mt-0.5"
            >
              + Add description
            </button>
          )}
        </div>

        {/* Subtle Right Controls */}
        <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover/field:opacity-100 transition-opacity">
          <Badge
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectField();
            }}
            className="h-5 px-1.5 text-[10px] font-normal gap-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors bg-background"
          >
            <Icon className="size-3" />
            <span>{qDef.label}</span>
          </Badge>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectField();
            }}
            className="size-6 text-muted-foreground/70 hover:text-foreground"
            title="Configure question properties"
          >
            <IconSettings className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="size-6 text-muted-foreground/70 hover:text-destructive"
            title="Delete question"
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Answer Preview */}
      <div className="pl-1 pt-0.5">
        {renderFieldPreview()}
      </div>
    </NodeViewWrapper>
  );
}

export const FormFieldNode = Node.create({
  name: "formField",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      fieldId: { default: null },
      kind: { default: "question" },
      type: { default: "short_text" },
      label: { default: "Untitled Question" },
      helpText: { default: null },
      placeholder: { default: null },
      required: { default: false },
      config: { default: {} },
      validationRules: { default: {} },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="form-field"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "form-field" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormFieldNodeView);
  },
});
