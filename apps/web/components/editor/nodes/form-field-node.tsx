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
  IconAlignLeft,
  IconArrowsSort,
  IconCalendar,
  IconCheckbox,
  IconChevronDown,
  IconCircleDot,
  IconClock,
  IconFileText,
  IconGripVertical,
  IconHash,
  IconLink,
  IconListCheck,
  IconMail,
  IconPhone,
  IconSettings,
  IconStar,
  IconTrash,
} from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export const getFieldTypeMeta = (type: string) => {
  switch (type) {
    case "short_text":
      return { label: "Short Text", icon: IconAlignLeft };
    case "long_text":
      return { label: "Long Text", icon: IconFileText };
    case "email":
      return { label: "Email", icon: IconMail };
    case "number":
      return { label: "Number", icon: IconHash };
    case "single_select":
      return { label: "Single Select", icon: IconCircleDot };
    case "multi_select":
      return { label: "Multi Select", icon: IconListCheck };
    case "dropdown":
      return { label: "Dropdown", icon: IconCircleDot };
    case "checkbox":
      return { label: "Checkbox", icon: IconCheckbox };
    case "phone":
      return { label: "Phone", icon: IconPhone };
    case "website_url":
      return { label: "Website URL", icon: IconLink };
    case "date":
      return { label: "Date", icon: IconCalendar };
    case "time":
      return { label: "Time", icon: IconClock };
    case "star_rating":
      return { label: "Star Rating", icon: IconStar };
    case "linear_rating":
      return { label: "Linear Scale", icon: IconStar };
    case "ranking":
      return { label: "Ranking", icon: IconArrowsSort };
    default:
      return { label: type, icon: IconFileText };
  }
};

function FormFieldNodeView({
  node,
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

  const typeMeta = getFieldTypeMeta(type);
  const Icon = typeMeta.icon;

  // Open properties panel for this field in parent editor
  const handleSelectField = () => {
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
  };

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

  const renderFieldPreview = () => {
    switch (type) {
      case "short_text":
        return (
          <Input
            disabled
            placeholder={placeholder || "Short answer text"}
            className="bg-muted/20 border-dashed cursor-not-allowed max-w-md"
          />
        );

      case "long_text":
        return (
          <Textarea
            disabled
            placeholder={placeholder || "Long answer text..."}
            rows={3}
            className="bg-muted/20 border-dashed cursor-not-allowed resize-none"
          />
        );

      case "email":
        return (
          <div className="relative max-w-md">
            <IconMail className="size-4 absolute left-3 top-3 text-muted-foreground/60" />
            <Input
              disabled
              placeholder={placeholder || "name@example.com"}
              className="pl-9 bg-muted/20 border-dashed cursor-not-allowed"
            />
          </div>
        );

      case "phone":
        return (
          <div className="relative max-w-xs">
            <IconPhone className="size-4 absolute left-3 top-3 text-muted-foreground/60" />
            <Input
              disabled
              placeholder={placeholder || "+1 (555) 000-0000"}
              className="pl-9 bg-muted/20 border-dashed cursor-not-allowed"
            />
          </div>
        );

      case "website_url":
        return (
          <div className="relative max-w-md">
            <IconLink className="size-4 absolute left-3 top-3 text-muted-foreground/60" />
            <Input
              disabled
              placeholder={placeholder || "https://"}
              className="pl-9 bg-muted/20 border-dashed cursor-not-allowed"
            />
          </div>
        );

      case "number":
        return (
          <div className="relative w-48">
            <IconHash className="size-4 absolute left-3 top-3 text-muted-foreground/60" />
            <Input
              type="number"
              disabled
              placeholder={placeholder || "0"}
              className="pl-9 bg-muted/20 border-dashed cursor-not-allowed"
            />
          </div>
        );

      case "date":
        return (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md bg-muted/20 text-muted-foreground text-sm w-48 cursor-not-allowed">
            <IconCalendar className="size-4" />
            <span>Select a date...</span>
          </div>
        );

      case "time":
        return (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md bg-muted/20 text-muted-foreground text-sm w-36 cursor-not-allowed">
            <IconClock className="size-4" />
            <span>--:-- --</span>
          </div>
        );

      case "single_select": {
        const options: Array<{ label: string }> = Array.isArray(config?.options)
          ? config.options
          : [{ label: "Option 1" }, { label: "Option 2" }];
        return (
          <div className="space-y-2 pt-1">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className="size-4 rounded-full border border-muted-foreground/50 shrink-0" />
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        );
      }

      case "multi_select": {
        const options: Array<{ label: string }> = Array.isArray(config?.options)
          ? config.options
          : [{ label: "Option 1" }, { label: "Option 2" }];
        return (
          <div className="space-y-2 pt-1">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className="size-4 rounded-sm border border-muted-foreground/50 shrink-0" />
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        );
      }

      case "dropdown": {
        const options: Array<{ label: string }> = Array.isArray(config?.options)
          ? config.options
          : [{ label: "Select an option..." }];
        return (
          <div className="flex items-center justify-between px-3 py-2 border border-dashed rounded-md bg-muted/20 text-muted-foreground text-sm max-w-xs cursor-not-allowed">
            <span>{options[0]?.label || "Select an option..."}</span>
            <IconChevronDown className="size-4" />
          </div>
        );
      }

      case "checkbox":
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <div className="size-4 rounded-sm border border-muted-foreground/50 shrink-0" />
            <span>{placeholder || "Check here to confirm / agree"}</span>
          </div>
        );

      case "star_rating": {
        const maxStars = typeof config?.max === "number" ? config.max : 5;
        return (
          <div className="flex items-center gap-1.5 py-1">
            {Array.from({ length: maxStars }).map((_, i) => (
              <IconStar
                key={i}
                className="size-5 text-muted-foreground/40 hover:text-amber-400 transition-colors"
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
                  className="size-8 rounded-md border border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground bg-muted/20"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            {(config?.minLabel || config?.maxLabel) && (
              <div className="flex justify-between text-[11px] text-muted-foreground max-w-sm">
                <span>{typeof config?.minLabel === "string" ? config.minLabel : ""}</span>
                <span>{typeof config?.maxLabel === "string" ? config.maxLabel : ""}</span>
              </div>
            )}
          </div>
        );
      }

      case "ranking": {
        const options: Array<{ label: string }> = Array.isArray(config?.options)
          ? config.options
          : [{ label: "Choice A" }, { label: "Choice B" }, { label: "Choice C" }];
        return (
          <div className="space-y-1.5 pt-1">
            {options.map((opt, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-dashed border-border/80 bg-muted/20 text-xs text-muted-foreground max-w-sm"
              >
                <span className="font-semibold text-foreground/70">{i + 1}.</span>
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        );
      }

      default:
        return (
          <Input
            disabled
            placeholder={placeholder || "Input preview"}
            className="bg-muted/20 border-dashed cursor-not-allowed"
          />
        );
    }
  };

  return (
    <NodeViewWrapper
      onClick={handleSelectField}
      className={`my-4 group/field rounded-xl border transition-all duration-150 bg-card cursor-pointer select-none ${
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-sm"
          : "border-border/80 hover:border-border hover:shadow-xs"
      }`}
    >
      <div className="p-4">
        {/* Field Card Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            {/* Drag Handle */}
            <div
              data-drag-handle
              className="mt-0.5 text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors shrink-0"
              title="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
            >
              <IconGripVertical className="size-4" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-foreground">
                  {label || "Untitled Question"}
                </span>
                {required && (
                  <span className="text-destructive font-bold text-xs" title="Required question">
                    *
                  </span>
                )}
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] font-normal gap-1 text-muted-foreground"
                >
                  <Icon className="size-3" />
                  <span>{typeMeta.label}</span>
                </Badge>
              </div>

              {helpText && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {helpText}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-1 opacity-70 group-hover/field:opacity-100 transition-opacity shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectField();
              }}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Configure properties"
            >
              <IconSettings className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="size-7 text-muted-foreground hover:text-destructive"
              title="Delete question"
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Realistic Field Preview */}
        <div className="pl-6 pt-1">
          {renderFieldPreview()}
        </div>
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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "form-field" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormFieldNodeView);
  },
});
