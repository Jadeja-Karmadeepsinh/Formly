"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconCircleCheck,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconRotateClockwise,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useForm } from "~/hooks/api/form";
import { useFormFields } from "~/hooks/api/form-field";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { RankingInteractive } from "~/components/editor/components/ranking-interactive";
import { getQuestionTypeDefinition } from "~/components/editor/registry/question-registry";

export interface PreviewFieldItem {
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

interface StoredDraftData {
  title: string;
  description: string;
  fields: PreviewFieldItem[];
  timestamp: number;
}

interface FormPreviewClientProps {
  formId: string;
}

export function FormPreviewClient({ formId }: FormPreviewClientProps) {
  // Device mode for responsive preview testing
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );

  // Local draft vs Database fallback state
  const [isLocalDraft, setIsLocalDraft] = React.useState<boolean>(false);
  const [draftLoaded, setDraftLoaded] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [fields, setFields] = React.useState<PreviewFieldItem[]>([]);

  // Simulation form answers & submission state
  const [answers, setAnswers] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);

  // Fallback backend queries (only used if sessionStorage draft is absent)
  const { form, isLoading: isFormLoading, isError: isFormError } = useForm(formId);
  const { fields: dbFields, isLoading: isFieldsLoading } = useFormFields(formId);

  // Read draft from sessionStorage on mount
  React.useEffect(() => {
    try {
      const storageKey = `formly_preview_draft_${formId}`;
      const rawDraft = sessionStorage.getItem(storageKey);
      if (rawDraft) {
        const parsed: StoredDraftData = JSON.parse(rawDraft);
        if (parsed && Array.isArray(parsed.fields)) {
          setTitle(parsed.title || "");
          setDescription(parsed.description || "");
          setFields(parsed.fields);
          setIsLocalDraft(true);
          setDraftLoaded(true);
          return;
        }
      }
    } catch {
      // sessionStorage unavailable or corrupt; fall through to DB
    }
    setDraftLoaded(true);
  }, [formId]);

  // If no sessionStorage draft, populate from DB queries
  React.useEffect(() => {
    if (draftLoaded && !isLocalDraft && form) {
      setTitle(form.title || "");
      setDescription(form.description || "");
      if (dbFields && Array.isArray(dbFields)) {
        const mapped: PreviewFieldItem[] = dbFields.map((f) => ({
          fieldId: f.id,
          kind: f.kind,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          helpText: f.helpText,
          required: Boolean(f.required),
          config: (f.config as Record<string, unknown>) || {},
          validationRules: (f.validationRules as Record<string, unknown>) || {},
        }));
        setFields(mapped);
      }
    }
  }, [draftLoaded, isLocalDraft, form, dbFields]);

  // Handle answering questions
  const handleAnswerChange = (fieldKey: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  };

  // Reset all answers
  const handleResetAnswers = () => {
    setAnswers({});
    setErrors({});
    setIsSubmitted(false);
    toast.info("Answers cleared");
  };

  // Simulate submit
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const key = field.fieldId || field.type;
      if (field.required) {
        const val = answers[key];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0) ||
          (field.type === "checkbox" && val !== true)
        ) {
          newErrors[key] = "This question is required";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please answer all required questions");
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`preview-field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitted(true);
    toast.success("Simulation submitted successfully!");
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

  if (!draftLoaded || (!isLocalDraft && (isFormLoading || isFieldsLoading))) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/20">
        <div className="h-14 border-b bg-background px-4 flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="max-w-2xl w-full mx-auto p-8 space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isLocalDraft && (isFormError || !form)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 p-4 text-center">
        <h2 className="text-xl font-bold">Form Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          The requested form could not be loaded for preview.
        </p>
        <Button asChild variant="outline">
          <Link href={`/dashboard/forms/${formId}`}>Return to Editor</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/25 text-foreground">
      {/* Top Preview Bar */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md shadow-2xs">
        {/* Left: Back Link & Badges */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link href={`/dashboard/forms/${formId}`}>
              <IconArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to Editor</span>
            </Link>
          </Button>

          <span className="text-muted-foreground/30 text-xs hidden sm:inline">|</span>

          <Badge
            variant="outline"
            className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium h-5"
          >
            Preview Mode
          </Badge>

          {isLocalDraft ? (
            <Badge
              variant="outline"
              className="text-[11px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 font-medium h-5 hidden md:inline-flex"
              title="Previewing current unsaved local changes from the editor tab"
            >
              Unsaved Draft
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[11px] text-muted-foreground h-5 hidden md:inline-flex"
            >
              Saved Version
            </Badge>
          )}
        </div>

        {/* Center: Device Switcher */}
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

        {/* Right: Reset answers and Close tab */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAnswers}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Reset simulated answers"
          >
            <IconRotateClockwise className="size-3.5" />
            <span className="hidden sm:inline">Reset Answers</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => window.close()}
            className="size-8 text-muted-foreground hover:text-foreground"
            title="Close preview tab"
          >
            <IconX className="size-4" />
          </Button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 flex justify-center items-start">
        <div
          className={`w-full ${getContainerWidth()} transition-all duration-200 bg-card border rounded-xl p-6 sm:p-10 shadow-xs space-y-8 my-auto`}
        >
          {/* Form Header */}
          <div className="border-b pb-6 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {title || "Untitled Form"}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Submitted Success Confirmation Screen */}
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <IconCircleCheck className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  Thank you for submitting!
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Preview mode: Form completed successfully. No response data was saved to the database.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetAnswers}
                className="mt-4 gap-1.5"
              >
                <IconRotateClockwise className="size-3.5" />
                <span>Submit another response</span>
              </Button>
            </div>
          ) : (
            /* Form Questions */
            <form onSubmit={handleSimulateSubmit} className="space-y-8">
              {fields.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  This form currently has no questions. Return to the editor to add questions.
                </div>
              ) : (
                fields.map((field, index) => {
                  const key = field.fieldId || `f_${index}`;
                  const hasError = Boolean(errors[key]);
                  const qDef = getQuestionTypeDefinition(field.type);
                  const Icon = qDef.icon;

                  return (
                    <div
                      key={key}
                      id={`preview-field-${key}`}
                      className={`space-y-2.5 transition-colors rounded-xl p-3 -mx-3 ${
                        hasError ? "bg-destructive/5 ring-1 ring-destructive/30" : ""
                      }`}
                    >
                      {/* Question Header: Icon, Label, Required Asterisk */}
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">
                            {index + 1}.
                          </span>
                          <div className="flex-1 text-sm font-semibold text-foreground leading-snug">
                            <span>{field.label || "Untitled Question"}</span>
                            {field.required && (
                              <span
                                className="text-destructive font-bold ml-1"
                                title="Required question"
                              >
                                *
                              </span>
                            )}
                          </div>
                        </div>

                        {field.helpText && (
                          <p className="text-xs text-muted-foreground pl-5">
                            {field.helpText}
                          </p>
                        )}
                      </div>

                      {/* Question Respondent Input */}
                      <div className="pl-5 pt-1">
                        {renderPreviewFieldInput(
                          field,
                          answers[key],
                          (val) => handleAnswerChange(key, val)
                        )}
                      </div>

                      {hasError && (
                        <p className="text-xs text-destructive font-medium pl-5">
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  );
                })
              )}

              {fields.length > 0 && (
                <div className="pt-6 border-t flex items-center justify-between">
                  <Button type="submit" size="default" className="px-6 font-medium">
                    Submit Response
                  </Button>
                  <span className="text-[11px] text-muted-foreground italic">
                    Preview only — submission will not record data
                  </span>
                </div>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

// Field Input Renderer for Preview
function renderPreviewFieldInput(
  field: PreviewFieldItem,
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
          className="max-w-md h-9 text-sm"
        />
      );

    case "long_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your answer"}
          rows={typeof config?.rows === "number" ? config.rows : 3}
          className="text-sm"
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "name@example.com"}
          className="max-w-md h-9 text-sm"
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "+1 (555) 000-0000"}
          className="max-w-xs h-9 text-sm"
        />
      );

    case "website_url":
      return (
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://example.com"}
          className="max-w-md h-9 text-sm"
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
          className="w-48 h-9 text-sm"
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-48 h-9 text-sm"
        />
      );

    case "time":
      return (
        <Input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-36 h-9 text-sm"
        />
      );

    case "single_select":
    case "dropdown": {
      const options: Array<{ label: string; value: string }> = Array.isArray(
        config?.options
      )
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
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                  isChecked
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border/70 hover:bg-muted/30"
                }`}
              >
                <div
                  className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isChecked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40"
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
      const options: Array<{ label: string; value: string }> = Array.isArray(
        config?.options
      )
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
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
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
      const options: Array<{ label: string; value: string }> = Array.isArray(
        config?.options
      )
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
          className="max-w-md h-9 text-sm"
        />
      );
  }
}

