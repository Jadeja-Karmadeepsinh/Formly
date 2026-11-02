"use client";

import * as React from "react";
import {
  IconArrowDown,
  IconArrowUp,
  IconListDetails,
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
import { getQuestionTypeDefinition } from "../registry/question-registry";

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
  const [showBulkAdd, setShowBulkAdd] = React.useState(false);
  const [bulkText, setBulkText] = React.useState("");

  if (!field) return null;

  const qDef = getQuestionTypeDefinition(field.type);
  const Icon = qDef.icon;

  const isChoiceField = Boolean(qDef.hasOptions);
  const isRatingField = Boolean(qDef.hasRatingScale);
  const isNumberField = Boolean(qDef.hasNumberBounds);
  const isTextField = Boolean(qDef.hasTextValidation);

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

  const handleMoveOption = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= rawOptions.length) return;

    const newOptions = [...rawOptions];
    const temp = newOptions[idx]!;
    newOptions[idx] = newOptions[targetIdx]!;
    newOptions[targetIdx] = temp;

    onUpdateField(field.fieldId, {
      config: { ...field.config, options: newOptions },
    });
  };

  const handleApplyBulkOptions = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 0) {
      const generated = lines.map((line, idx) => ({
        label: line,
        value: line.toLowerCase().replace(/\s+/g, "_") || `opt_${idx + 1}`,
      }));
      onUpdateField(field.fieldId, {
        config: { ...field.config, options: generated },
      });
      setBulkText("");
      setShowBulkAdd(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col p-6 gap-6">
        <SheetHeader className="p-0 border-b pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs gap-1 py-0.5 bg-background">
              <Icon className="size-3 text-muted-foreground" />
              <span>{qDef.label}</span>
            </Badge>
          </div>
          <SheetTitle className="text-base font-semibold">
            Question Properties
          </SheetTitle>
          <SheetDescription className="text-xs">
            {qDef.description}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6">
          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="prop_label" className="text-xs font-medium">
              Question Title
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

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="prop_helpText" className="text-xs font-medium">
              Description (optional)
            </Label>
            <Textarea
              id="prop_helpText"
              value={field.helpText || ""}
              onChange={(e) =>
                onUpdateField(field.fieldId, {
                  helpText: e.target.value || null,
                })
              }
              placeholder="Enter optional supporting description or instructions for respondents..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Placeholder (for text/input fields) */}
          {qDef.hasPlaceholder && (
            <div className="space-y-1.5">
              <Label htmlFor="prop_placeholder" className="text-xs font-medium">
                {field.type === "checkbox" ? "Agreement Text" : "Placeholder Text"}
              </Label>
              <Input
                id="prop_placeholder"
                value={field.placeholder || ""}
                onChange={(e) =>
                  onUpdateField(field.fieldId, {
                    placeholder: e.target.value || null,
                  })
                }
                placeholder={qDef.defaultPlaceholder || "Placeholder hint..."}
                className="text-xs"
              />
            </div>
          )}

          {/* Required Switch */}
          <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="prop_required" className="text-xs font-medium cursor-pointer">
                Required Question
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Respondents cannot submit the form without answering
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
            <div className="space-y-3 rounded-xl border p-3.5 bg-card shadow-2xs">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Choices & Options</Label>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBulkAdd(!showBulkAdd)}
                    className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-1.5"
                  >
                    <IconListDetails className="size-3 mr-1" />
                    <span>{showBulkAdd ? "Close Bulk" : "Bulk Add"}</span>
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    ({rawOptions.length})
                  </span>
                </div>
              </div>

              {showBulkAdd ? (
                <div className="space-y-2 p-2.5 rounded-lg border bg-muted/30">
                  <Label className="text-[11px] text-muted-foreground">
                    Enter one choice per line:
                  </Label>
                  <Textarea
                    rows={4}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"Option A\nOption B\nOption C"}
                    className="text-xs resize-none"
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBulkAdd(false)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplyBulkOptions}
                      className="text-xs h-7"
                    >
                      Apply Choices
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {rawOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="flex items-center text-muted-foreground/40 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={i === 0}
                          onClick={() => handleMoveOption(i, "up")}
                          className="size-6 text-muted-foreground/50 hover:text-foreground disabled:opacity-20"
                          title="Move choice up"
                        >
                          <IconArrowUp className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={i === rawOptions.length - 1}
                          onClick={() => handleMoveOption(i, "down")}
                          className="size-6 text-muted-foreground/50 hover:text-foreground disabled:opacity-20"
                          title="Move choice down"
                        >
                          <IconArrowDown className="size-3" />
                        </Button>
                      </div>

                      <Input
                        value={opt.label}
                        onChange={(e) => handleUpdateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="text-xs h-8 flex-1"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={rawOptions.length <= 1}
                        onClick={() => handleRemoveOption(i)}
                        className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <IconTrash className="size-3.5" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="w-full text-xs h-8 gap-1.5 mt-2"
                  >
                    <IconPlus className="size-3.5" />
                    <span>Add Choice</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Rating Scale Configuration */}
          {isRatingField && (
            <div className="space-y-3 rounded-xl border p-3.5 bg-card">
              <Label className="text-xs font-medium">Rating Scale</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Maximum Scale</span>
                  <select
                    value={
                      typeof field.config?.max === "number"
                        ? field.config.max
                        : field.type === "star_rating"
                        ? 5
                        : 10
                    }
                    onChange={(e) =>
                      onUpdateField(field.fieldId, {
                        config: { ...field.config, max: Number(e.target.value) },
                      })
                    }
                    className="border rounded-md px-2.5 py-1 text-xs bg-background"
                  >
                    {field.type === "star_rating" ? (
                      <>
                        <option value={3}>3 Stars</option>
                        <option value={5}>5 Stars (Default)</option>
                        <option value={7}>7 Stars</option>
                        <option value={10}>10 Stars</option>
                      </>
                    ) : (
                      <>
                        <option value={5}>1 to 5</option>
                        <option value={7}>1 to 7</option>
                        <option value={10}>1 to 10 (Default)</option>
                      </>
                    )}
                  </select>
                </div>

                {field.type === "linear_rating" && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Low Label</Label>
                      <Input
                        value={
                          typeof field.config?.minLabel === "string"
                            ? field.config.minLabel
                            : ""
                        }
                        onChange={(e) =>
                          onUpdateField(field.fieldId, {
                            config: { ...field.config, minLabel: e.target.value },
                          })
                        }
                        placeholder="e.g. Not likely"
                        className="text-xs h-8 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">High Label</Label>
                      <Input
                        value={
                          typeof field.config?.maxLabel === "string"
                            ? field.config.maxLabel
                            : ""
                        }
                        onChange={(e) =>
                          onUpdateField(field.fieldId, {
                            config: { ...field.config, maxLabel: e.target.value },
                          })
                        }
                        placeholder="e.g. Very likely"
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
            <div className="space-y-3 rounded-xl border p-3.5 bg-card">
              <Label className="text-xs font-medium">Number Validation</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    value={
                      typeof field.config?.min === "number"
                        ? field.config.min
                        : ""
                    }
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
                    value={
                      typeof field.config?.max === "number"
                        ? field.config.max
                        : ""
                    }
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
                    value={
                      typeof field.config?.step === "number"
                        ? field.config.step
                        : ""
                    }
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
            <div className="space-y-3 rounded-xl border p-3.5 bg-card">
              <Label className="text-xs font-medium">Character Constraints</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Min Length</Label>
                  <Input
                    type="number"
                    value={
                      typeof field.validationRules?.min === "number"
                        ? field.validationRules.min
                        : ""
                    }
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
                  <Label className="text-[11px] text-muted-foreground">Max Length</Label>
                  <Input
                    type="number"
                    value={
                      typeof field.validationRules?.max === "number"
                        ? field.validationRules.max
                        : ""
                    }
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
            <span>Delete Question</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
