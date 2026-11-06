"use client";

import * as React from "react";
import { SectionHeader, Crosshair } from "./frame";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const FAQS = [
  {
    question: "What does 'document-first form builder' mean?",
    answer:
      "Unlike traditional builders where you drag individual widget cards into an abstract column structure, Formly operates like a continuous text document (similar to Notion or Google Docs). You write headings, paragraphs, and questions inline on the page, using slash commands (/) to insert interactive inputs anywhere.",
  },
  {
    question: "How does immutable snapshot versioning protect my data?",
    answer:
      "Whenever you hit Publish, Formly takes a permanent cryptographic snapshot of your form's schema in PostgreSQL. If you change a question, add new options, or delete a field next month, previously collected responses remain permanently linked to the exact version the respondent saw. Your historic data is never silently corrupted.",
  },
  {
    question: "Can I edit a form after respondents have already submitted answers?",
    answer:
      "Yes, completely safely. When you edit a published form, your changes remain in a private draft state. Active respondents continue seeing the current published snapshot without disruption. When your new edits are ready, you publish Version 2, which becomes the active target for future respondents.",
  },
  {
    question: "What types of questions and elements are supported?",
    answer:
      "Formly supports 18 distinct block types: Short Text, Long Paragraphs, Single Choice (Radio), Multiple Selection (Checkboxes), Dropdown Menus, Linear Rating Scales (1–10), Star Ratings, Dates, Times, Email Addresses, Phone Numbers, Numeric Inputs, Website URLs, as well as Document Headings, Helper Text, and Horizontal Dividers.",
  },
  {
    question: "How do respondents access and submit my forms?",
    answer:
      "Every published form receives a fast, unique shareable link (such as formly.app/f/your-id). Respondents can complete the form on mobile, tablet, or desktop browsers without registering an account. The runtime is privacy-first, lightweight, and loads in milliseconds.",
  },
  {
    question: "How do responses and analytics work?",
    answer:
      "Every submission is recorded in real-time in your dashboard. You can inspect individual respondent answers chronologically or view aggregated analytics (submission volume over time, completion rates, average completion duration, and per-question drop-off metrics). You can also export submissions to CSV anytime.",
  },
] as const;

export function LandingFAQ() {
  return (
    <div id="faq" className="relative w-full">
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      {/* Section Header */}
      <div className="px-4 sm:px-8 py-12 sm:py-16 border-b border-border/80 bg-background">
        <SectionHeader
          index="06"
          eyebrow="Frequently Asked Questions"
          title="Clear answers to practical questions."
          description="Everything you need to know about Formly's architecture, versioning model, and respondent privacy."
        />
      </div>

      {/* Lined Accordion Grid */}
      <div className="w-full border-b border-border/80 bg-background">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-border/80 px-4 sm:px-8 last:border-b-0 hover:bg-muted/10 transition-colors"
            >
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground hover:no-underline py-5 text-left">
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground font-normal">
                    0{index + 1}
                  </span>
                  <span>{faq.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-8 pr-4 pb-5 pt-1">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
