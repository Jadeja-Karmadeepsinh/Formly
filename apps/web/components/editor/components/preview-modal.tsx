"use client";

import * as React from "react";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { getQuestionTypeDefinition } from "../registry/question-registry";
import { RankingInteractive } from "./ranking-interactive";

export interface PreviewFieldData {
  fieldId?: string;
  kind?: string;
  type: string;
  label?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  required?: boolean;
  config?: Record<string, unknown>;
  validationRules?: Record<string, unknown>;
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
        <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/40 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium">
              Preview Mode
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Simulated respondent view — responses are not saved
            </span>
          </div>

          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-background shadow-2xs">
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
        <div className="flex-1 overflow-y-auto bg-muted/15 p-6 md:p-12 flex justify-center">
          <div className={`w-full ${getContainerWidth()} transition-all duration-200 bg-card border rounded-2xl p-6 md:p-10 shadow-xs h-fit space-y-8`}>
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
              <div className="space-y-7">
                {fields.map((field, index) => {
                  const key = field.fieldId || `f_${index}`;
                  const val = mockValues[key];

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-medium text-sm text-foreground">
                          {field.label || `Question ${index + 1}`}
                        </span>
                        {field.required && (
                          <span className="text-destructive font-bold text-xs" title="Required">
                            *
                          </span>
                        )}
                      </div>

                      {field.helpText && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {field.helpText}
                        </p>
                      )}

                      {/* Field Preview Control */}
                      <div className="pt-1">
                        {renderPreviewInput(field, val, (newVal) =>
                          handleValueChange(key, newVal)
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t flex items-center justify-between">
                  <Button type="button" className="w-full sm:w-auto px-6 h-9 text-xs">
                    Submit (Preview)
                  </Button>
                  <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
                    Simulated response
                  </span>
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
          className="max-w-md h-9 text-xs"
        />
      );

    case "long_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your answer"}
          rows={typeof config?.rows === "number" ? config.rows : 3}
          className="text-xs"
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "name@example.com"}
          className="max-w-md h-9 text-xs"
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "+1 (555) 000-0000"}
          className="max-w-xs h-9 text-xs"
        />
      );

    case "website_url":
      return (
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://example.com"}
          className="max-w-md h-9 text-xs"
        />
      );

    case "number":
      return (
        <Input
          type="number"
          min={typeof config?.min === "number" ? config.min : undefined}
          max={typeof config?.max === "number" ? config.max : undefined}
          step={typeof config?.step === "number" ? config.step : undefined}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          placeholder={placeholder || "0"}
          className="w-48 h-9 text-xs"
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-48 h-9 text-xs"
        />
      );

    case "time":
      return (
        <Input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-36 h-9 text-xs"
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
        <div className="space-y-1.5 pt-0.5">
          {options.map((opt, i) => {
            const isChecked = value === opt.value;
            return (
              <label
                key={i}
                onClick={() => onChange(opt.value)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  isChecked
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border/70 hover:bg-muted/30"
                }`}
              >
                <div
                  className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
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
        <div className="space-y-1.5 pt-0.5">
          {options.map((opt, i) => {
            const isChecked = currentVals.includes(opt.value);
            return (
              <label
                key={i}
                onClick={() => toggleOption(opt.value)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
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
            className="text-xs font-normal cursor-pointer"
          >
            {placeholder || "I agree to the terms and conditions"}
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
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
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
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: maxScore }).map((_, i) => {
              const score = i + 1;
              const isSelected = currentScore === score;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(score)}
                  className={`size-9 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border/80 hover:bg-accent/40"
                  }`}
                >
                  {score}
                </button>
              );
            })}
          </div>
          {Boolean(config?.minLabel || config?.maxLabel) && (
            <div className="flex justify-between text-[11px] text-muted-foreground max-w-sm pt-0.5">
              <span>{typeof config?.minLabel === "string" ? config.minLabel : ""}</span>
              <span>{typeof config?.maxLabel === "string" ? config.maxLabel : ""}</span>
            </div>
          )}
        </div>
      );
    }

    case "ranking": {
      const options: Array<{ label: string; value: string }> = Array.isArray(config?.options)
        ? (config?.options as any)
        : [
            { label: "Option 1", value: "opt_1" },
            { label: "Option 2", value: "opt_2" },
            { label: "Option 3", value: "opt_3" },
          ];

      return (
        <RankingInteractive
          options={options}
          value={Array.isArray(value) ? value : undefined}
          onChange={(rankedValues) => onChange(rankedValues)}
        />
      );
    }

    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your answer"}
          className="max-w-md h-9 text-xs"
        />
      );
  }
}
