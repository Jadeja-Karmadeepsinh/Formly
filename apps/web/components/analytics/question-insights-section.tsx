"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlignLeft,
  Check,
  CheckSquare,
  ChevronRight,
  Copy,
  ExternalLink,
  HelpCircle,
  Inbox,
  ListFilter,
  Radio,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useQuestionInsights } from "~/hooks/api/form-submission";
import type { FormItem } from "~/hooks/api/form";

interface QuestionInsightsSectionProps {
  formId?: string;
  forms: FormItem[];
  onSelectFormId: (formId: string | undefined) => void;
}

export function QuestionInsightsSection({
  formId,
  forms,
  onSelectFormId,
}: QuestionInsightsSectionProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const { insights, questions, totalSubmissions, isLoading } = useQuestionInsights(formId);

  const selectedForm = React.useMemo(() => {
    return forms.find((f) => f.id === formId);
  }, [forms, formId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "single_select":
      case "dropdown":
        return <Radio className="size-3.5 text-primary" />;
      case "multi_select":
      case "checkbox":
        return <CheckSquare className="size-3.5 text-primary" />;
      case "linear_rating":
      case "star_rating":
        return <Star className="size-3.5 text-amber-500 fill-amber-500/20" />;
      case "short_text":
      case "long_text":
      case "email":
        return <AlignLeft className="size-3.5 text-primary" />;
      default:
        return <Tag className="size-3.5 text-muted-foreground" />;
    }
  };

  // State 1: No form selected ("All Forms" workspace view) -> Show Form Selector Navigator
  if (!formId) {
    return (
      <Card className="panel-highlight border-border/80 bg-card shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              Question-Level Insights
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Select a form to inspect question-by-question answer distributions, rating histograms, and respondent feedback.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {forms.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectFormId(f.id)}
                className="panel-highlight flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 hover:border-foreground/20 active:scale-[0.98] transition-all text-left group cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {f.title}
                    </span>
                    {f.status === "published" && (
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">
                    Click to analyze answers
                  </span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // State 2: Loading questions
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border-border/60 bg-card/60">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // State 3: Form selected with questions
  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">
              Form Question Analysis
            </span>
            <span>·</span>
            <span className="text-xs font-medium text-foreground">
              {selectedForm?.title || "Selected Form"}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {questions.length} {questions.length === 1 ? "Question" : "Questions"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Aggregated responses across {totalSubmissions} completed submissions for this form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs gap-1.5 border-border/70 hover:bg-muted active:scale-[0.98] transition-all"
          >
            <Link href={`/dashboard/responses?formId=${formId}`}>
              <Inbox className="size-3.5 text-muted-foreground" />
              <span>View All Responses</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectFormId(undefined)}
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="size-3.5" />
            <span>Clear Focus</span>
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card className="panel-highlight border-border/80 bg-card shadow-2xs">
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            No questions configured in the published version of this form yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, idx) => {
            const isChoice = [
              "single_select",
              "multi_select",
              "dropdown",
              "checkbox",
            ].includes(q.type);
            const isRating = ["linear_rating", "star_rating", "number"].includes(q.type);

            return (
              <Card
                key={q.elementId}
                className="panel-highlight border-border/80 bg-card shadow-2xs transition-all hover:border-foreground/20 flex flex-col justify-between"
              >
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <span>#{idx + 1}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 capitalize text-foreground/80 font-sans">
                          {getQuestionTypeIcon(q.type)}
                          <span>{q.type.replace(/_/g, " ")}</span>
                        </span>
                        {q.required && <span className="text-destructive font-bold">*</span>}
                      </div>
                      <CardTitle className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {q.label}
                      </CardTitle>
                    </div>

                    <Badge variant="secondary" className="text-[11px] font-mono shrink-0">
                      {q.totalAnswers} answered
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0 flex-1">
                  {/* Choice-Based Distribution */}
                  {isChoice && (
                    <div className="space-y-2.5 pt-1">
                      {q.distribution.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">
                          No option selections recorded yet.
                        </p>
                      ) : (
                        q.distribution.map((opt) => (
                          <div key={opt.optionLabel} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-foreground truncate max-w-[200px]">
                                {opt.optionLabel}
                              </span>
                              <span className="font-mono text-muted-foreground shrink-0 pl-2">
                                {opt.count} ({opt.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(opt.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Rating / Number Summary */}
                  {isRating && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono text-foreground">
                          {q.averageScore !== null ? q.averageScore.toFixed(1) : "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Average score across {q.totalAnswers} ratings
                        </span>
                      </div>
                      {q.distribution.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {q.distribution.map((score) => (
                            <div key={score.optionLabel} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-muted-foreground">
                                  {score.optionLabel}
                                </span>
                                <span className="font-mono text-muted-foreground">
                                  {score.count} ({score.percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${Math.min(score.percentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text / Open-ended Feedback */}
                  {!isChoice && !isRating && (
                    <div className="space-y-2 pt-1">
                      {q.recentAnswers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">
                          No text responses submitted yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {q.recentAnswers.map((ans) => {
                            const valStr = typeof ans.value === "object" ? JSON.stringify(ans.value) : String(ans.value);
                            const isCopied = copiedId === ans.id;

                            return (
                              <div
                                key={ans.id}
                                className="group relative p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs text-foreground flex items-center justify-between gap-2"
                              >
                                <p className="truncate font-sans leading-relaxed">{valStr}</p>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(valStr, ans.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                  title="Copy response"
                                >
                                  {isCopied ? (
                                    <Check className="size-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="size-3" />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
