"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  RotateCcw,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
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

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to submit
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        const formEl = document.getElementById("public-formly-runner-form") as HTMLFormElement;
        if (formEl) {
          formEl.requestSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          newErrors[field.id] = "This question requires an answer";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please answer all required questions");
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
      // toast is automatically handled
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress metrics
  const answeredCount = React.useMemo(() => {
    return fields.filter((f) => {
      const val = answers[f.id];
      return (
        val !== undefined &&
        val !== null &&
        val !== "" &&
        (!Array.isArray(val) || val.length > 0)
      );
    }).length;
  }, [fields, answers]);

  const progressPercent = fields.length > 0 ? Math.round((answeredCount / fields.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-8 space-y-6 shadow-sm">
          <Skeleton className="h-8 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-sm space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <Lock className="size-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Form Not Available</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This form could not be found or the link may have expired or been deleted.
          </p>
          <Button asChild variant="outline" className="w-full mt-2 h-9 text-xs rounded-xl">
            <Link href="/">Back to Formly Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (form.status !== "published") {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-sm space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Form Currently Closed</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This form is currently not accepting new responses. The author has set its status to {form.status}.
          </p>
          <div className="pt-2">
            <Badge variant="outline" className="text-xs capitalize font-mono">
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
        <div className="panel-highlight w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 md:p-10 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-9" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Response Recorded!</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {customMessage || (
                <>
                  Thank you for completing <span className="font-semibold text-foreground">{form.title}</span>. Your submission has been securely recorded.
                </>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span>Timestamp:</span>
              <span className="font-mono text-foreground">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Verification:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">Secured & Signed</span>
            </div>
          </div>

          {allowMultiple && (
            <div className="pt-1">
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
                className="text-xs h-8 rounded-xl border-border/80 gap-1.5 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Submit another response</span>
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-border/60 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-muted-foreground/70" />
            <span>Powered by Formly · Verified Record</span>
          </div>
        </div>
      </div>
    );
  }

  const submitBtnText = (form.settings as any)?.submitButtonText || "Submit Response";

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center py-8 sm:py-14 px-4">
      {/* Top Floating Progress Header */}
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-[11px] font-medium text-foreground">
            {answeredCount} of {fields.length} answered ({progressPercent}%)
          </span>
        </div>
        <div className="w-28 sm:w-36 bg-muted/60 rounded-full h-1.5 overflow-hidden border border-border/40">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Framed Document Canvas */}
      <div className="panel-highlight w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-6 sm:p-10 md:p-12 shadow-sm relative">
        {/* Form Title & Description */}
        <div className="border-b border-border/60 pb-6 mb-8 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {form.description}
            </p>
          )}
        </div>

        {/* Form Body */}
        <form id="public-formly-runner-form" onSubmit={handleSubmit} className="space-y-8">
          {fields.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              This form does not contain any questions.
            </div>
          ) : (
            fields.map((field, idx) => {
              const val = answers[field.id];
              const error = errors[field.id];
              const orderFormatted = String(idx + 1).padStart(2, "0");

              return (
                <div
                  key={field.id}
                  id={`field-${field.id}`}
                  className="space-y-2.5 transition-all p-4 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/10"
                >
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/60">
                      {orderFormatted}
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-foreground">
                      {field.label || "Untitled Question"}
                    </span>
                    {field.required && (
                      <span className="text-[11px] font-mono text-destructive uppercase tracking-wider font-semibold">
                        * Required
                      </span>
                    )}
                  </div>

                  {field.helpText && (
                    <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                      {field.helpText}
                    </p>
                  )}

                  {/* Input Element */}
                  <div className="pt-2 pl-0 sm:pl-8">
                    {renderPublicFieldInput(
                      field,
                      val,
                      (newVal) => handleAnswerChange(field.id, newVal)
                    )}
                  </div>

                  {error && (
                    <p className="text-xs text-destructive font-medium mt-1 pl-8">
                      {error}
                    </p>
                  )}
                </div>
              );
            })
          )}

          {fields.length > 0 && (
            <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-6 font-semibold text-xs rounded-xl gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>{submitBtnText}</span>
              </Button>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                  Ctrl + ↵
                </span>
                <span>to submit quickly</span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Runner Footer */}
      <footer className="mt-8 text-xs text-muted-foreground flex items-center gap-1.5">
        <span>Powered by</span>
        <span className="font-semibold text-foreground">Formly</span>
        <span>·</span>
        <span>Secure Response Collector</span>
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
          placeholder={placeholder || "Type your answer..."}
          className="max-w-md h-9 text-xs rounded-xl bg-card border-border/80 shadow-2xs"
        />
      );

    case "long_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Type your detailed answer..."}
          rows={4}
          className="text-xs rounded-xl bg-card border-border/80 shadow-2xs"
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "name@example.com"}
          className="max-w-md h-9 text-xs rounded-xl bg-card border-border/80 shadow-2xs font-mono"
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "+1 (555) 000-0000"}
          className="max-w-xs h-9 text-xs rounded-xl bg-card border-border/80 shadow-2xs font-mono"
        />
      );

    case "website_url":
      return (
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://..."}
          className="max-w-md h-9 text-xs rounded-xl bg-card border-border/80 shadow-2xs font-mono"
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          placeholder={placeholder || "0"}
          className="w-48 h-9 text-xs rounded-xl bg-card border-border/80 shadow-2xs font-mono"
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-48 h-9 text-xs rounded-xl bg-card border-border/80 shadow-2xs font-mono"
        />
      );

    case "time":
      return (
        <Input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-36 h-9 text-xs rounded-xl bg-card border-border/80 shadow-2xs font-mono"
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
            const letter = String.fromCharCode(65 + i);

            return (
              <label
                key={i}
                onClick={() => onChange(opt.value)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? "border-primary bg-primary/5 font-semibold text-foreground shadow-2xs"
                    : "border-border/70 hover:border-border hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isChecked && <div className="size-1.5 rounded-full bg-background" />}
                  </div>
                  <span className="text-foreground">{opt.label}</span>
                </div>

                <span className="font-mono text-[10px] text-muted-foreground border border-border/60 bg-muted/40 px-1.5 py-0.5 rounded">
                  {letter}
                </span>
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
            const letter = String.fromCharCode(65 + i);

            return (
              <label
                key={i}
                onClick={() => toggleOption(opt.value)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? "border-primary bg-primary/5 font-semibold text-foreground shadow-2xs"
                    : "border-border/70 hover:border-border hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleOption(opt.value)}
                  />
                  <span className="text-foreground">{opt.label}</span>
                </div>

                <span className="font-mono text-[10px] text-muted-foreground border border-border/60 bg-muted/40 px-1.5 py-0.5 rounded">
                  {letter}
                </span>
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
            className="text-xs font-normal cursor-pointer text-foreground"
          >
            {placeholder || "I agree / confirm"}
          </Label>
        </div>
      );

    case "star_rating": {
      const maxStars = typeof config?.max === "number" ? config.max : 5;
      const rating = typeof value === "number" ? value : 0;

      return (
        <div className="flex items-center gap-2 py-1">
          {Array.from({ length: maxStars }).map((_, i) => {
            const starValue = i + 1;
            const isFilled = rating >= starValue;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(starValue)}
                className="p-1 hover:scale-115 transition-transform cursor-pointer"
              >
                <Star
                  className={`size-6 sm:size-7 ${
                    isFilled
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30 hover:text-amber-300"
                  }`}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="text-xs font-mono text-muted-foreground ml-2">
              {rating} / {maxStars}
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
                  className={`size-9 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-2xs scale-105"
                      : "border-border/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {score}
                </button>
              );
            })}
          </div>
          {(config?.minLabel || config?.maxLabel) && (
            <div className="flex justify-between text-[11px] text-muted-foreground max-w-sm pt-1">
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
          placeholder={placeholder || "Your answer..."}
          className="text-xs rounded-xl bg-card border-border/80 shadow-2xs"
        />
      );
  }
}
