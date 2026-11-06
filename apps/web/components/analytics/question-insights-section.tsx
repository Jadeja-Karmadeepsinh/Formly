"use client";

import * as React from "react";
import {
  AlignLeft,
  CheckSquare,
  HelpCircle,
  ListFilter,
  Radio,
  Star,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useQuestionInsights } from "~/hooks/api/form-submission";

interface QuestionInsightsSectionProps {
  formId: string;
}

export function QuestionInsightsSection({ formId }: QuestionInsightsSectionProps) {
  const { insights, questions, totalSubmissions, isLoading } = useQuestionInsights(formId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/60 bg-card/60">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-5/6" />
                <Skeleton className="h-2 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="border-border/60 bg-card/75 shadow-2xs">
        <CardContent className="p-6 text-center text-muted-foreground text-xs">
          No question elements configured for this form yet.
        </CardContent>
      </Card>
    );
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "single_select":
      case "dropdown":
        return <Radio className="size-3.5 text-muted-foreground" />;
      case "multi_select":
      case "checkbox":
        return <CheckSquare className="size-3.5 text-muted-foreground" />;
      case "linear_rating":
      case "star_rating":
        return <Star className="size-3.5 text-amber-500" />;
      case "short_text":
      case "long_text":
      case "email":
        return <AlignLeft className="size-3.5 text-muted-foreground" />;
      default:
        return <Tag className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Question-Level Insights
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Answer distribution across {totalSubmissions} submitted responses for this form.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          {questions.length} Questions
        </Badge>
      </div>

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
              className="border-border/60 bg-card/75 shadow-2xs transition-all hover:border-border"
            >
              <CardHeader className="p-4 sm:p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <span>#{idx + 1}</span>
                      <span>·</span>
                      <span className="capitalize">{q.type.replace(/_/g, " ")}</span>
                      {q.required && <span className="text-destructive font-bold">*</span>}
                    </div>
                    <CardTitle className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                      {q.label}
                    </CardTitle>
                  </div>
                  <div className="p-1.5 rounded-md bg-muted/30 shrink-0">
                    {getQuestionTypeIcon(q.type)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
                  <span>{q.totalAnswers} answered</span>
                  {q.averageScore !== null && (
                    <span className="font-semibold text-foreground">
                      Avg Score: {q.averageScore}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                {/* 1. Choice Distribution */}
                {isChoice && q.distribution.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    {q.distribution.map((dist, dIdx) => (
                      <div key={dIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground truncate max-w-[70%]">
                            {dist.optionLabel}
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {dist.count} ({dist.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary/80 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(dist.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Rating Histogram */}
                {isRating && q.distribution.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-end gap-1.5 h-16 pt-2">
                      {q.distribution.map((dist, dIdx) => (
                        <div key={dIdx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div
                            className="w-full bg-primary/75 rounded-xs transition-all hover:bg-primary"
                            style={{ height: `${Math.max(dist.percentage, 8)}%` }}
                            title={`${dist.optionLabel}: ${dist.count} (${dist.percentage}%)`}
                          />
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {dist.optionLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Text Answers Preview */}
                {!isChoice && !isRating && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    {q.recentAnswers.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No responses submitted for this question yet.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {q.recentAnswers.slice(0, 4).map((ans) => (
                          <div
                            key={ans.id}
                            className="p-2 rounded-lg bg-muted/20 border border-border/40 text-xs text-foreground"
                          >
                            <p className="line-clamp-2">{String(ans.value)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

