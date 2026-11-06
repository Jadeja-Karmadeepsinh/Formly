"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconCircleCheck,
  IconClock,
  IconLoader,
  IconLock,
  IconStar,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { usePublicForm } from "~/hooks/api/form";
import { useStartSubmission, useCompleteSubmission } from "~/hooks/api/form-submission";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Label } from "~/components/ui/label";
import { RankingInteractive } from "~/components/editor/components/ranking-interactive";

interface PublicFormRunnerProps {
  shareId: string;
}

export function PublicFormRunner({ shareId }: PublicFormRunnerProps) {
  const { form, fields, isLoading, isError } = usePublicForm(shareId);

  const [answers, setAnswers] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionId, setSubmissionId] = React.useState<string | null>(null);

  const { startSubmissionAsync } = useStartSubmission();
  const { completeSubmissionAsync } = useCompleteSubmission();

  const hasStartedRef = React.useRef(false);

  // Initialize submission attempt
  const initAttempt = React.useCallback(async () => {
    if (!form || form.status !== "published") return;

    try {
      const storageKey = `formly_attempt_${shareId}`;
      let clientAttemptId =
        typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null;

      if (!clientAttemptId) {
        clientAttemptId = crypto.randomUUID();
        if (typeof window !== "undefined") {
          sessionStorage.setItem(storageKey, clientAttemptId);
        }
      }

      const res = await startSubmissionAsync({
        shareId,
        clientAttemptId,
      });

      setSubmissionId(res.submissionId);
    } catch (err: any) {
      console.warn("Failed to initialize submission attempt:", err.message);
    }
  }, [form, shareId, startSubmissionAsync]);

  React.useEffect(() => {
    if (form && form.status === "published" && !hasStartedRef.current) {
      hasStartedRef.current = true;
      void initAttempt();
    }
  }, [form, initAttempt]);

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation for required fields
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required) {
        const val = answers[field.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0) ||
          (field.type === "checkbox" && val !== true)
        ) {
          newErrors[field.id] = "This question is required";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please answer all required questions");
      // Scroll to first error
      const firstErrorId = Object.keys(newErrors)[0];
      if (firstErrorId) {
        const el = document.getElementById(`field-${firstErrorId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    // 2. Ensure attempt is started
    let activeSubmissionId = submissionId;
    if (!activeSubmissionId) {
      try {
        const storageKey = `formly_attempt_${shareId}`;
        let clientAttemptId =
          typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null;
        if (!clientAttemptId) {
          clientAttemptId = crypto.randomUUID();
          if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, clientAttemptId);
          }
        }
        const res = await startSubmissionAsync({
          shareId,
          clientAttemptId,
        });
        activeSubmissionId = res.submissionId;
        setSubmissionId(res.submissionId);
      } catch (err: any) {
        toast.error(err.message || "Failed to start submission session");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Format answers payload
      const formattedAnswers = Object.entries(answers)
        .filter(([, val]) => val !== undefined && val !== null && val !== "")
        .map(([fieldId, val]) => ({
          formVersionElementId: fieldId,
          value: val,
        }));

      await completeSubmissionAsync({
        submissionId: activeSubmissionId,
        answers: formattedAnswers,
      });

      // Clear storage for this attempt
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`formly_attempt_${shareId}`);
      }

      setIsSubmitted(true);
    } catch {
      // toast is automatically displayed by onError in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-2xl bg-card border rounded-xl p-8 space-y-6 shadow-xs">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-card border rounded-xl p-8 shadow-xs space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <IconLock className="size-6" />
          </div>
          <h2 className="text-xl font-bold">Form Not Available</h2>
          <p className="text-sm text-muted-foreground">
            This form could not be found or the link may be invalid.
          </p>
          <Button asChild variant="outline" className="w-full mt-2">
            <Link href="/">Back to Formly</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (form.status !== "published") {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-card border rounded-xl p-8 shadow-xs space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <IconClock className="size-6" />
          </div>
          <h2 className="text-xl font-bold">Form Closed</h2>
          <p className="text-sm text-muted-foreground">
            This form is currently not accepting responses because it is in draft or closed status.
          </p>
          <div className="pt-2">
            <Badge variant="outline" className="text-xs capitalize">
              Status: {form.status}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const customMessage = (form.settings as any)?.customSuccessMessage;
    const allowMultiple = (form.settings as any)?.allowMultipleSubmissions ?? true;

    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-card border rounded-xl p-8 md:p-10 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <IconCircleCheck className="size-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Response Recorded!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {customMessage || (
              <>
                Thank you for completing <span className="font-semibold text-foreground">{form.title}</span>. Your submission has been securely recorded.
              </>
            )}
          </p>
          {allowMultiple && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setAnswers({});
                  setIsSubmitted(false);
                  setSubmissionId(null);
                  hasStartedRef.current = false;
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem(`formly_attempt_${shareId}`);
                  }
                  void initAttempt();
                }}
                className="text-xs"
              >
                Submit another response
              </Button>
            </div>
          )}
          <div className="pt-4 border-t text-[11px] text-muted-foreground/60">
            Powered by Formly
          </div>
        </div>
      </div>
    );
  }

  const submitBtnText = (form.settings as any)?.submitButtonText || "Submit Response";

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center py-10 md:py-16 px-4">
      <div className="w-full max-w-2xl bg-card border rounded-xl p-6 sm:p-10 shadow-sm animate-fade-in-blur">
        {/* Form Header */}
        <div className="border-b pb-6 mb-8 space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {form.description}
            </p>
          )}
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {fields.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              This form does not have any questions yet.
            </div>
          ) : (
            fields.map((field, idx) => {
              const val = answers[field.id];
              const error = errors[field.id];

              return (
                <div
                  key={field.id}
                  id={`field-${field.id}`}
                  className="space-y-2.5 transition-all"
                >
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-medium text-sm text-foreground">
                      {idx + 1}. {field.label || "Untitled Question"}
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

                  {/* Field Input Control */}
                  <div className="pt-1">
                    {renderPublicFieldInput(
                      field,
                      val,
                      (newVal) => handleAnswerChange(field.id, newVal)
                    )}
                  </div>

                  {error && (
                    <p className="text-xs text-destructive font-medium mt-1">
                      {error}
                    </p>
                  )}
                </div>
              );
            })
          )}

          {fields.length > 0 && (
            <div className="pt-6 border-t flex items-center justify-between">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 font-medium h-10 gap-2"
              >
                {isSubmitting && <IconLoader className="size-4 animate-spin" />}
                <span>{submitBtnText}</span>
              </Button>

              <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
                Never submit passwords or sensitive credentials.
              </span>
            </div>
          )}
        </form>
      </div>

      <footer className="mt-8 text-xs text-muted-foreground flex items-center gap-1.5">
        <span>Powered by</span>
        <span className="font-semibold text-foreground">Formly</span>
      </footer>
    </div>
  );
}

function renderPublicFieldInput(
  field: any,
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
          className="max-w-md"
        />
      );

    case "long_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your answer"}
          rows={4}
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "name@example.com"}
          className="max-w-md"
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "+1 (555) 000-0000"}
          className="max-w-xs"
        />
      );

    case "website_url":
      return (
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://example.com"}
          className="max-w-md"
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
        : [];

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
                    : "border-border/70 hover:bg-muted/40"
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
        : [];

      const currentVals: string[] = Array.isArray(value) ? value : [];

      const toggleOption = (valToToggle: string) => {
        if (currentVals.includes(valToToggle)) {
          onChange(currentVals.filter((v: string) => v !== valToToggle));
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
                    : "border-border/70 hover:bg-muted/40"
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
        <div className="flex items-center gap-2.5 pt-1">
          <Checkbox
            id={`cb_${field.id}`}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(Boolean(checked))}
          />
          <Label
            htmlFor={`cb_${field.id}`}
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
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
              >
                <IconStar
                  className={`size-7 ${
                    isFilled
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30 hover:text-amber-300"
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
                  className={`size-10 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
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
          {(config?.minLabel || config?.maxLabel) && (
            <div className="flex justify-between text-xs text-muted-foreground max-w-sm pt-1">
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
        : [];

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
        />
      );
  }
}
