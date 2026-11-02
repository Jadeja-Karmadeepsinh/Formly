"use client";

import * as React from "react";
import {
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";

export interface FieldSettingsData {
  label: string;
  placeholder?: string | null;
  helpText?: string | null;
  required: boolean;
  config: Record<string, unknown>;
  validationRules: Record<string, unknown>;
}

interface FormFieldSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  initialData: FieldSettingsData;
  onSave: (data: FieldSettingsData) => void;
}

export function FormFieldSettingsDialog({
  open,
  onOpenChange,
  type,
  initialData,
  onSave,
}: FormFieldSettingsDialogProps) {
  const [label, setLabel] = React.useState(initialData.label || "");
  const [placeholder, setPlaceholder] = React.useState(
    initialData.placeholder || ""
  );
  const [helpText, setHelpText] = React.useState(initialData.helpText || "");
  const [required, setRequired] = React.useState(initialData.required ?? false);

  // Choice-based options
  const isChoiceField = [
    "single_select",
    "multi_select",
    "dropdown",
    "ranking",
  ].includes(type);

  const initialOptions = Array.isArray(initialData.config?.options)
    ? (initialData.config.options as Array<{ id?: string; label: string; value: string }>)
    : [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ];

  const [options, setOptions] = React.useState<
    Array<{ id?: string; label: string; value: string }>
  >(initialOptions);

  // Rating config
  const isRatingField = ["star_rating", "linear_rating"].includes(type);
  const [ratingMax, setRatingMax] = React.useState<number>(
    typeof initialData.config?.max === "number"
      ? initialData.config.max
      : type === "star_rating"
      ? 5
      : 10
  );

  React.useEffect(() => {
    if (open) {
      setLabel(initialData.label || "");
      setPlaceholder(initialData.placeholder || "");
      setHelpText(initialData.helpText || "");
      setRequired(initialData.required ?? false);
      setOptions(
        Array.isArray(initialData.config?.options) &&
          initialData.config.options.length > 0
          ? (initialData.config.options as Array<{ id?: string; label: string; value: string }>)
          : [
              { label: "Option 1", value: "option_1" },
              { label: "Option 2", value: "option_2" },
            ]
      );
      setRatingMax(
        typeof initialData.config?.max === "number"
          ? initialData.config.max
          : type === "star_rating"
          ? 5
          : 10
      );
    }
  }, [open, initialData, type]);

  const handleAddOption = () => {
    const nextNum = options.length + 1;
    setOptions([
      ...options,
      { label: `Option ${nextNum}`, value: `option_${nextNum}` },
    ]);
  };

  const handleUpdateOption = (index: number, newLabel: string) => {
    const next = [...options];
    const item = next[index];
    if (item) {
      next[index] = {
        ...item,
        label: newLabel,
        value: newLabel.toLowerCase().replace(/\s+/g, "_") || `option_${index + 1}`,
      };
      setOptions(next);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const newConfig: Record<string, unknown> = { ...initialData.config };
    if (isChoiceField) {
      newConfig.options = options.map((opt, i) => ({
        label: opt.label.trim() || `Option ${i + 1}`,
        value: opt.value.trim() || `option_${i + 1}`,
      }));
    }
    if (isRatingField) {
      newConfig.max = ratingMax;
      newConfig.min = 1;
    }

    onSave({
      label: label.trim(),
      placeholder: placeholder.trim() || null,
      helpText: helpText.trim() || null,
      required,
      config: newConfig,
      validationRules: initialData.validationRules || {},
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Field Settings</DialogTitle>
            <DialogDescription>
              Configure question details, placeholder, and response rules.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="field-label">
                Question / Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="field-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. What is your full name?"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-placeholder">Placeholder Text</Label>
              <Input
                id="field-placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="e.g. Type your answer here..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-helpText">Help Text / Description</Label>
              <Textarea
                id="field-helpText"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                placeholder="Additional instructions for respondents (optional)"
                rows={2}
              />
            </div>

            {isChoiceField && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddOption}
                    className="h-7 text-xs gap-1"
                  >
                    <IconPlus className="size-3" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={opt.label}
                        onChange={(e) =>
                          handleUpdateOption(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                        disabled={options.length <= 1}
                        className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <IconX className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isRatingField && (
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="rating-scale">Maximum Rating Value</Label>
                <Input
                  id="rating-scale"
                  type="number"
                  min={3}
                  max={10}
                  value={ratingMax}
                  onChange={(e) => setRatingMax(Number(e.target.value))}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="required-toggle" className="cursor-pointer">
                  Required Question
                </Label>
                <p className="text-xs text-muted-foreground">
                  Respondents must answer this field before submitting
                </p>
              </div>
              <Switch
                id="required-toggle"
                checked={required}
                onCheckedChange={setRequired}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!label.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
