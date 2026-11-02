"use client";

import * as React from "react";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export interface PreviewFieldData {
  fieldId?: string;
  kind?: string;
  type: string;
  label?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  required?: boolean;
  config?: Record<string, unknown>;
}

interface FormPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fields: PreviewFieldData[];
}

export function FormPreviewModal({
  open,
  onOpenChange,
  title,
  description,
  fields,
}: FormPreviewModalProps) {
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [mockValues, setMockValues] = React.useState<Record<string, any>>({});

  const handleValueChange = (key: string, val: any) => {
    setMockValues((prev) => ({ ...prev, [key]: val }));
  };

  const getContainerWidth = () => {
    switch (device) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-xl";
      case "desktop":
      default:
        return "max-w-3xl";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Preview Top Bar */}
        <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
              Preview Mode
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Simulated respondent view — responses are not saved
            </span>
          </div>

          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-background">
            <Button
              type="button"
              variant={device === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => setDevice("desktop")}
              title="Desktop view"
            >
              <IconDeviceDesktop className="size-4" />
            </Button>
            <Button
              type="button"
              variant={device === "tablet" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => setDevice("tablet")}
              title="Tablet view"
            >
              <IconDeviceTablet className="size-4" />
            </Button>
            <Button
              type="button"
              variant={device === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => setDevice("mobile")}
              title="Mobile view"
            >
              <IconDeviceMobile className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-10 flex justify-center">
          <div className={`w-full ${getContainerWidth()} transition-all duration-200 bg-card border rounded-2xl p-6 md:p-10 shadow-sm h-fit space-y-8`}>
            {/* Header */}
            <div className="border-b pb-6 space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {title || "Untitled Form"}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Questions List */}
            {fields.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No questions added to this form yet.
              </div>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => {
                  const key = field.fieldId || `f_${index}`;
                  const val = mockValues[key];

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-medium text-sm text-foreground">
                          {field.label || `Question ${index + 1}`}
                        </span>
                        {field.required && (
                          <span className="text-destructive font-semibold text-xs">*</span>
                        )}
                      </div>

                      {field.helpText && (
                        <p className="text-xs text-muted-foreground">{field.helpText}</p>
                      )}

                      {/* Realistic Field Renderers */}
                      <div className="pt-1">
                        {renderPreviewInput(field, val, (newVal) =>
                          handleValueChange(key, newVal)
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t">
                  <Button type="button" className="w-full sm:w-auto px-6">
                    Submit (Preview)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function renderPreviewInput(
  field: PreviewFieldData,
  value: any,
  onChange: (val: any) => void
) {
  const { type, placeholder, config } = field;

  switch (type) {
    case "short_text":
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your answer"}
        />
      );

    case "long_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your answer"}
          rows={3}
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "name@example.com"}
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "+1 (555) 000-0000"}
        />
      );

    case "website_url":
      return (
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://example.com"}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          placeholder={placeholder || "0"}
          className="w-48"
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-48"
        />
      );

    case "time":
      return (
        <Input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-36"
        />
      );

    case "single_select":
    case "dropdown": {
      const options: Array<{ label: string; value: string }> = Array.isArray(config?.options)
        ? (config?.options as any)
        : [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ];

      return (
        <div className="space-y-2">
          {options.map((opt, i) => {
            const isChecked = value === opt.value;
            return (
              <label
                key={i}
                onClick={() => onChange(opt.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                  isChecked
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border/70 hover:bg-muted/30"
                }`}
              >
                <div
                  className={`size-4 rounded-full border flex items-center justify-center ${
                    isChecked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                  }`}
                >
                  {isChecked && <div className="size-1.5 rounded-full bg-background" />}
                </div>
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case "multi_select": {
      const options: Array<{ label: string; value: string }> = Array.isArray(config?.options)
        ? (config?.options as any)
        : [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ];

      const currentVals: string[] = Array.isArray(value) ? value : [];

      const toggleOption = (valToToggle: string) => {
        if (currentVals.includes(valToToggle)) {
          onChange(currentVals.filter((v) => v !== valToToggle));
        } else {
          onChange([...currentVals, valToToggle]);
        }
      };

      return (
        <div className="space-y-2">
          {options.map((opt, i) => {
            const isChecked = currentVals.includes(opt.value);
            return (
              <label
                key={i}
                onClick={() => toggleOption(opt.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                  isChecked
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border/70 hover:bg-muted/30"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleOption(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case "checkbox":
      return (
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id={`mock_cb_${field.fieldId}`}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(Boolean(checked))}
          />
          <Label
            htmlFor={`mock_cb_${field.fieldId}`}
            className="text-sm font-normal cursor-pointer"
          >
            {placeholder || "I agree / confirm"}
          </Label>
        </div>
      );

    case "star_rating": {
      const maxStars = typeof config?.max === "number" ? config.max : 5;
      const rating = typeof value === "number" ? value : 0;

      return (
        <div className="flex items-center gap-1.5 py-1">
          {Array.from({ length: maxStars }).map((_, i) => {
            const starValue = i + 1;
            const isFilled = rating >= starValue;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(starValue)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <IconStar
                  className={`size-6 ${
                    isFilled
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              {rating} of {maxStars}
            </span>
          )}
        </div>
      );
    }

    case "linear_rating": {
      const maxScore = typeof config?.max === "number" ? config.max : 10;
      const currentScore = typeof value === "number" ? value : null;

      return (
        <div className="space-y-2 py-1">
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: maxScore }).map((_, i) => {
              const score = i + 1;
              const isSelected = currentScore === score;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(score)}
                  className={`size-10 rounded-lg border text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/80 hover:bg-accent/40"
                  }`}
                >
                  {score}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground max-w-sm pt-1">
            <span>{typeof config?.minLabel === "string" ? config.minLabel : "Not likely"}</span>
            <span>{typeof config?.maxLabel === "string" ? config.maxLabel : "Extremely likely"}</span>
          </div>
        </div>
      );
    }

    case "ranking": {
      const options: Array<{ label: string; value: string }> = Array.isArray(config?.options)
        ? (config?.options as any)
        : [
            { label: "First Item", value: "item_1" },
            { label: "Second Item", value: "item_2" },
            { label: "Third Item", value: "item_3" },
          ];

      return (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/70 bg-card text-sm"
            >
              <div className="size-6 rounded bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0">
                {i + 1}
              </div>
              <span className="flex-1">{opt.label}</span>
            </div>
          ))}
        </div>
      );
    }

    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your answer"}
        />
      );
  }
}

