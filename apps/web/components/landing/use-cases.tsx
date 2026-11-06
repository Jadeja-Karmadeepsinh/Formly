import * as React from "react";
import { SectionHeader, Crosshair } from "./frame";
import { Badge } from "~/components/ui/badge";

const USE_CASES = [
  {
    category: "CUSTOMER RESEARCH",
    title: "Product Feedback & CSAT",
    description: "Measure customer satisfaction, feature demand, and usability feedback with structured rating scales.",
    fields: ["Rating Scale (1-10)", "Multi-line Feedback", "Work Email"],
    example: "How would you rate your onboarding experience?",
  },
  {
    category: "INTERNAL OPERATIONS",
    title: "Team IT & Access Requests",
    description: "Streamline internal hardware requests, software access provisioning, and equipment ordering.",
    fields: ["Dropdown Selection", "Short Text", "Single Choice"],
    example: "Which system or hardware do you need access to?",
  },
  {
    category: "COMMUNITY & EVENTS",
    title: "Event RSVP & Registration",
    description: "Collect attendee headcounts, dietary requirements, and session preferences without friction.",
    fields: ["Attendee Name", "Email Address", "Dietary Radios"],
    example: "Will you attend our live launch keynote in person?",
  },
  {
    category: "TALENT & RECRUITING",
    title: "Candidate Screening Surveys",
    description: "Gather background experience, portfolio URLs, and availability before scheduling screening interviews.",
    fields: ["URL Input", "Experience Scale", "Availability Date"],
    example: "Link your GitHub or personal portfolio site",
  },
  {
    category: "LEAD GENERATION",
    title: "Contact & Demo Inquiries",
    description: "Capture high-intent inbound sales leads with zero drop-off, routing key responses directly to your team.",
    fields: ["Company Domain", "Team Size Radio", "Needs Description"],
    example: "How many team members will use Formly?",
  },
  {
    category: "PRODUCT ENGINEERING",
    title: "Bug & Issue Reports",
    description: "Collect clean diagnostic information from beta testers, including steps to reproduce and environment.",
    fields: ["Bug Severity Choice", "Steps to Reproduce", "App Version"],
    example: "Describe what went wrong and expected behavior",
  },
];

export function LandingUseCases() {
  return (
    <div id="templates" className="relative w-full">
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* Section Header with Count Badge */}
      <div className="px-4 sm:px-8 py-12 sm:py-16 border-b border-border/80 bg-background flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <SectionHeader
          index="04"
          eyebrow="Practical Applications"
          title="Designed for forms that teams rely on daily."
          description="From internal team operations to customer feedback. Create whatever your organization needs in minutes."
        />

        {/* Count Badge */}
        <div className="shrink-0">
          <Badge
            variant="outline"
            className="font-mono text-xs px-3 py-1 bg-muted/30 border-border/80 text-foreground"
          >
            Use Cases (06)
          </Badge>
        </div>
      </div>

      {/* Lined Grid: 3 columns desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 divide-border/80 md:[&>*]:border-b md:[&>*]:border-border/80 lg:[&>*:nth-child(3n)]:border-r-0 md:[&>*:not(:nth-child(2n))]:border-r lg:[&>*:not(:nth-child(3n))]:border-r">
        {USE_CASES.map((uc, i) => (
          <div
            key={i}
            className="group p-6 sm:p-7 flex flex-col justify-between hover:bg-muted/15 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <span>{uc.category}</span>
                <span className="font-mono text-[10px] text-muted-foreground/60">0{i + 1}</span>
              </div>

              <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-foreground">
                {uc.title}
              </h3>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {uc.description}
              </p>
            </div>

            {/* Example Field Tags & Mock Question */}
            <div className="mt-6 pt-4 border-t border-border/60 space-y-2.5">
              <div className="rounded border border-border/60 bg-muted/20 px-2.5 py-1.5 text-[11px] text-foreground font-medium truncate">
                &ldquo;{uc.example}&rdquo;
              </div>

              <div className="flex flex-wrap gap-1">
                {uc.fields.map((f, fi) => (
                  <span
                    key={fi}
                    className="font-mono text-[10px] rounded bg-muted/40 border border-border/60 px-1.5 py-0.5 text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
