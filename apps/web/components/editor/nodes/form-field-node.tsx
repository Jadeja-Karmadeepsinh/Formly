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
import {
  FormFieldSettingsDialog,
  type FieldSettingsData,
} from "../components/form-field-settings-dialog";

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
  updateAttributes,
  deleteNode,
  editor,
  selected,
}: NodeViewProps) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

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

  const handleSaveSettings = (data: FieldSettingsData) => {
    updateAttributes(data);

    // Notify Formly editor handler if attached to editor storage
    const onFieldUpdated = (
      editor?.storage as {
        formly?: {
          onFieldUpdated?: (id: string, d: FieldSettingsData) => void;
        };
      }
    )?.formly?.onFieldUpdated;
    if (typeof onFieldUpdated === "function" && fieldId) {
      onFieldUpdated(fieldId, data);
    }
  };

  const handleDelete = () => {
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
      case "email":
      case "phone":
      case "website_url":
        return (
          <Input
            disabled
            placeholder={placeholder || `Enter ${typeMeta.label.toLowerCase()}...`}
            className="bg-muted/30 border-dashed cursor-not-allowed"
          />
        );

      case "long_text":
        return (
          <Textarea
            disabled
            placeholder={placeholder || "Enter long answer..."}
            rows={3}
            className="bg-muted/30 border-dashed cursor-not-allowed resize-none"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            disabled
            placeholder={placeholder || "0"}
            className="bg-muted/30 border-dashed cursor-not-allowed w-48"
          />
        );

      case "date":
        return (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md bg-muted/30 text-muted-foreground text-sm w-48 cursor-not-allowed">
            <IconCalendar className="size-4" />
            <span>Select a date...</span>
          </div>
        );

      case "time":
        return (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md bg-muted/30 text-muted-foreground text-sm w-36 cursor-not-allowed">
            <IconClock className="size-4" />
            <span>--:-- --</span>
          </div>
        );

      case "single_select":
      case "dropdown": {
        const options: Array<{ label: string }> = Array.isArray(config?.options)
          ? config.options
          : [{ label: "Option 1" }, { label: "Option 2" }];
        return (
          <div className="space-y-1.5 pt-1">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
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
          <div className="space-y-1.5 pt-1">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-4 rounded-sm border border-muted-foreground/50 shrink-0" />
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        );
      }

      case "checkbox":
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <div className="size-4 rounded-sm border border-muted-foreground/50 shrink-0" />
            <span>{placeholder || "Check here to confirm"}</span>
          </div>
        );

      case "star_rating": {
        const maxStars = config?.max || 5;
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
        const maxScore = config?.max || 10;
        return (
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            {Array.from({ length: maxScore }).map((_, i) => (
              <div
                key={i}
                className="size-8 rounded-md border border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground bg-muted/20"
              >
                {i + 1}
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
            className="bg-muted/30 border-dashed cursor-not-allowed"
          />
        );
    }
  };

  return (
    <NodeViewWrapper
      className={`my-3.5 group/field rounded-lg border transition-all duration-150 bg-card ${
        selected
          ? "border-primary ring-1 ring-primary shadow-sm"
          : "border-border/80 hover:border-border hover:shadow-xs"
      }`}
    >
      <div className="p-3.5">
        {/* Field Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {/* Drag Handle */}
            <button
              type="button"
              data-drag-handle
              className="mt-0.5 text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors shrink-0"
              title="Drag to reorder"
            >
              <IconGripVertical className="size-4" />
            </button>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-foreground">
                  {label || "Untitled Question"}
                </span>
                {required && (
                  <span className="text-destructive font-semibold text-xs" title="Required field">
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

          {/* Action buttons (hover/visible) */}
          <div className="flex items-center gap-1 opacity-80 group-hover/field:opacity-100 transition-opacity shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Configure field"
            >
              <IconSettings className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="size-7 text-muted-foreground hover:text-destructive"
              title="Delete field"
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Interactive / Visual Field Preview */}
        <div className="pl-6 pt-1">
          {renderFieldPreview()}
        </div>
      </div>

      <FormFieldSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        type={type}
        initialData={{
          label,
          placeholder,
          helpText,
          required,
          config: config || {},
          validationRules: validationRules || {},
        }}
        onSave={handleSaveSettings}
      />
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
