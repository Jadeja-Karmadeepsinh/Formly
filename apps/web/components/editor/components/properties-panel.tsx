"use client";

import * as React from "react";
import {
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { getFieldTypeMeta } from "../nodes/form-field-node";

export interface PropertiesFieldData {
  fieldId: string;
  type: string;
  label: string;
  placeholder?: string | null;
  helpText?: string | null;
  required: boolean;
  config: Record<string, unknown>;
  validationRules: Record<string, unknown>;
}

interface PropertiesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: PropertiesFieldData | null;
  onUpdateField: (fieldId: string, updates: Partial<PropertiesFieldData>) => void;
  onDeleteField: (fieldId: string) => void;
}

export function PropertiesPanel({
  open,
  onOpenChange,
  field,
  onUpdateField,
  onDeleteField,
}: PropertiesPanelProps) {
  if (!field) return null;

  const typeMeta = getFieldTypeMeta(field.type);
  const Icon = typeMeta.icon;

  const isChoiceField = [
    "single_select",
    "multi_select",
    "dropdown",
    "ranking",
  ].includes(field.type);

  const isRatingField = ["star_rating", "linear_rating"].includes(field.type);
  const isNumberField = field.type === "number";
  const isTextField = ["short_text", "long_text", "email", "phone", "website_url"].includes(field.type);

  // Choice Options
  const rawOptions = Array.isArray(field.config?.options)
    ? (field.config.options as Array<{ id?: string; label: string; value: string }>)
    : [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ];

  const handleAddOption = () => {
    const nextIdx = rawOptions.length + 1;
    const newOptions = [
      ...rawOptions,
      { label: `Option ${nextIdx}`, value: `option_${nextIdx}` },
    ];
    onUpdateField(field.fieldId, {
      config: { ...field.config, options: newOptions },
    });
  };

  const handleUpdateOption = (idx: number, newLabel: string) => {
    const newOptions = [...rawOptions];
    const target = newOptions[idx];
    if (target) {
      newOptions[idx] = {
        ...target,
        label: newLabel,
        value: target.value || newLabel.toLowerCase().replace(/\s+/g, "_"),
      };
      onUpdateField(field.fieldId, {
        config: { ...field.config, options: newOptions },
      });
    }
  };

  const handleRemoveOption = (idx: number) => {
    if (rawOptions.length <= 1) return;
    const newOptions = rawOptions.filter((_, i) => i !== idx);
    onUpdateField(field.fieldId, {
      config: { ...field.config, options: newOptions },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col p-6 gap-6">
        <SheetHeader className="p-0 border-b pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs gap-1 py-0.5">
              <Icon className="size-3 text-muted-foreground" />
              <span>{typeMeta.label}</span>
            </Badge>
          </div>
          <SheetTitle className="text-base font-semibold">
            Field Properties
          </SheetTitle>
          <SheetDescription className="text-xs">
            Configure question label, placeholder, rules, and choices.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6">
          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="prop_label" className="text-xs font-medium">
              Question Title / Label
            </Label>
            <Input
              id="prop_label"
              value={field.label || ""}
              onChange={(e) =>
                onUpdateField(field.fieldId, { label: e.target.value })
              }
              placeholder="e.g. What is your email?"
              className="text-xs"
            />
          </div>

          {/* Description / Help text */}
          <div className="space-y-1.5">
            <Label htmlFor="prop_helpText" className="text-xs font-medium">
              Help Text / Instructions (optional)
            </Label>
            <Textarea
              id="prop_helpText"
              value={field.helpText || ""}
              onChange={(e) =>
                onUpdateField(field.fieldId, {
                  helpText: e.target.value || null,
                })
              }
              placeholder="Add extra guidance for respondents..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Placeholder (for text/input fields) */}
          {!isChoiceField && !isRatingField && (
            <div className="space-y-1.5">
              <Label htmlFor="prop_placeholder" className="text-xs font-medium">
                Placeholder Text
              </Label>
              <Input
                id="prop_placeholder"
                value={field.placeholder || ""}
                onChange={(e) =>
                  onUpdateField(field.fieldId, {
                    placeholder: e.target.value || null,
                  })
                }
                placeholder="Hint inside empty input..."
                className="text-xs"
              />
            </div>
          )}

          {/* Required Switch */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="prop_required" className="text-xs font-medium cursor-pointer">
                Required Field
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Respondents must answer this question before submitting
              </p>
            </div>
            <Switch
              id="prop_required"
              checked={field.required}
              onCheckedChange={(checked) =>
                onUpdateField(field.fieldId, { required: checked })
              }
            />
          </div>

          {/* Choice Options Manager */}
          {isChoiceField && (
            <div className="space-y-3 rounded-lg border p-3 bg-card">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Options</Label>
                <span className="text-[11px] text-muted-foreground">
                  {rawOptions.length} items
                </span>
              </div>

              <div className="space-y-2">
                {rawOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={opt.label}
                      onChange={(e) => handleUpdateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="text-xs h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={rawOptions.length <= 1}
                      onClick={() => handleRemoveOption(i)}
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <IconTrash className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="w-full text-xs h-8 gap-1.5"
              >
                <IconPlus className="size-3.5" />
                <span>Add Option</span>
              </Button>
            </div>
          )}

          {/* Rating Scale Configuration */}
          {isRatingField && (
            <div className="space-y-3 rounded-lg border p-3 bg-card">
              <Label className="text-xs font-medium">Rating Scale</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Maximum Score</span>
                  <select
                    value={typeof field.config?.max === "number" ? field.config.max : (field.type === "star_rating" ? 5 : 10)}
                    onChange={(e) =>
                      onUpdateField(field.fieldId, {
                        config: { ...field.config, max: Number(e.target.value) },
                      })
                    }
                    className="border rounded px-2 py-1 text-xs bg-background"
                  >
                    {field.type === "star_rating" ? (
                      <>
                        <option value={3}>3 Stars</option>
                        <option value={5}>5 Stars</option>
                        <option value={7}>7 Stars</option>
                        <option value={10}>10 Stars</option>
                      </>
                    ) : (
                      <>
                        <option value={5}>1 to 5</option>
                        <option value={7}>1 to 7</option>
                        <option value={10}>1 to 10</option>
                      </>
                    )}
                  </select>
                </div>

                {field.type === "linear_rating" && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Low Label</Label>
                      <Input
                        value={typeof field.config?.minLabel === "string" ? field.config.minLabel : ""}
                        onChange={(e) =>
                          onUpdateField(field.fieldId, {
                            config: { ...field.config, minLabel: e.target.value },
                          })
                        }
                        placeholder="e.g. Poor"
                        className="text-xs h-8 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">High Label</Label>
                      <Input
                        value={typeof field.config?.maxLabel === "string" ? field.config.maxLabel : ""}
                        onChange={(e) =>
                          onUpdateField(field.fieldId, {
                            config: { ...field.config, maxLabel: e.target.value },
                          })
                        }
                        placeholder="e.g. Excellent"
                        className="text-xs h-8 mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Number Field Bounds */}
          {isNumberField && (
            <div className="space-y-3 rounded-lg border p-3 bg-card">
              <Label className="text-xs font-medium">Number Validation</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    value={typeof field.config?.min === "number" ? field.config.min : ""}
                    onChange={(e) =>
                      onUpdateField(field.fieldId, {
                        config: {
                          ...field.config,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="Min"
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    value={typeof field.config?.max === "number" ? field.config.max : ""}
                    onChange={(e) =>
                      onUpdateField(field.fieldId, {
                        config: {
                          ...field.config,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="Max"
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Step</Label>
                  <Input
                    type="number"
                    value={typeof field.config?.step === "number" ? field.config.step : ""}
                    onChange={(e) =>
                      onUpdateField(field.fieldId, {
                        config: {
                          ...field.config,
                          step: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="1"
                    className="text-xs h-8 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Length Rules */}
          {isTextField && (
            <div className="space-y-3 rounded-lg border p-3 bg-card">
              <Label className="text-xs font-medium">Text Length Bounds</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Min Characters</Label>
                  <Input
                    type="number"
                    value={typeof field.validationRules?.min === "number" ? field.validationRules.min : ""}
                    onChange={(e) =>
                      onUpdateField(field.fieldId, {
                        validationRules: {
                          ...field.validationRules,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g. 2"
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Max Characters</Label>
                  <Input
                    type="number"
                    value={typeof field.validationRules?.max === "number" ? field.validationRules.max : ""}
                    onChange={(e) =>
                      onUpdateField(field.fieldId, {
                        validationRules: {
                          ...field.validationRules,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g. 500"
                    className="text-xs h-8 mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Question action */}
        <div className="border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onDeleteField(field.fieldId);
              onOpenChange(false);
            }}
            className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-9"
          >
            <IconTrash className="size-4" />
            <span>Delete this question</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

