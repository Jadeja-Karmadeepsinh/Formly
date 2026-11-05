"use client";

import * as React from "react";
import { Badge } from "~/components/ui/badge";

const USE_CASES = [
  {
    title: "Product & Customer Feedback",
    category: "Product & Growth",
    description:
      "Collect actionable bug reports, feature requests, and satisfaction scores with intuitive rating scales and open text fields.",
    questions: ["How satisfied are you with the latest release?", "What feature should we prioritize next?"],
    sampleTag: "Rating + Long text",
  },
  {
    title: "Event & Workshop Registration",
    category: "Operations & Community",
    description:
      "Gather attendee details, dietary preferences, and session selections with clean single-choice pills and validation.",
    questions: ["Which session track will you attend?", "Do you have any dietary restrictions?"],
    sampleTag: "Single select + Short text",
  },
  {
    title: "Team Requests & Project Intake",
    category: "Internal Workflows",
    description:
      "Streamline creative briefs, IT support tickets, and feature intake without messy email threads or lost spreadsheets.",
    questions: ["Project deadline and target launch date", "Attach brief or describe scope"],
    sampleTag: "Date picker + Textarea",
  },
  {
    title: "User Research & Concept Testing",
    category: "Design & UX",
    description:
      "Run targeted questionnaires with respondents. Review qualitative answers side-by-side in your tabular response dashboard.",
    questions: ["Rank the usability of the new checkout flow", "What caused the most friction?"],
    sampleTag: "Likert scale + Open feedback",
  },
] as const;

export function LandingUseCases() {
  return (
    <section id="use-cases" className="border-t border-border/50 bg-muted/15 py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-16 sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Practical Applications
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Built for any team that values clear answers.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
            From product research to event signups, Formly provides the structure you need without unnecessary complexity.
          </p>
        </div>

        {/* 4 Focused Use Cases in a 2x2 Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-6 sm:p-7 shadow-2xs transition-all duration-200 hover:border-foreground/30 hover:shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    {uc.category}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
                    {uc.sampleTag}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  {uc.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {uc.description}
                </p>
              </div>

              {/* Realistic Mini Preview Box */}
              <div className="mt-6 rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Example Questions
                </span>
                {uc.questions.map((q, idx) => (
                  <div key={q} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="font-mono text-muted-foreground text-[11px] mt-0.5">
                      {idx + 1}.
                    </span>
                    <span className="font-medium">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
