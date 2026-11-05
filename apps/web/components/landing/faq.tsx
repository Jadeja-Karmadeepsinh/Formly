"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const FAQS = [
  {
    question: "What is Formly?",
    answer:
      "Formly is a modern, document-first SaaS form builder. It combines the fluid writing experience of tools like Notion and Tally with strict relational data integrity, allowing you to create beautiful forms simply by typing.",
  },
  {
    question: "How do I create and edit questions?",
    answer:
      "Open any form in your dashboard and start typing on the clean document canvas. Type '/' to open the slash-command menu, select a question or content type, and write your question directly on the page.",
  },
  {
    question: "How does Formly's versioning system work?",
    answer:
      "Whenever you save changes or publish a form, Formly captures an immutable version snapshot in PostgreSQL. If you update or delete a question next week, previously submitted answers remain permanently linked to the exact snapshot the respondent saw.",
  },
  {
    question: "How do respondents access and fill out my forms?",
    answer:
      "When you publish a form, you receive a clean, 16-character public link (such as formly.app/f/your-share-id). Respondents can complete the form on mobile, tablet, or desktop browsers without needing to register or download anything.",
  },
  {
    question: "What types of form fields are supported?",
    answer:
      "Formly supports 18 distinct element types across questions and layout content: Short Text, Long Text, Multiple Choice, Single Select, Dropdown, Linear Rating Scales, Star Ratings, Dates, Times, Email, Phone, Numbers, Website URLs, Checkboxes, as well as Headings, Paragraphs, and Dividers.",
  },
  {
    question: "Can I manage and export collected responses?",
    answer:
      "Yes. Every submitted response is captured in real-time in your project's tabular submissions workspace. You can view all answers chronologically and inspect individual respondent submissions.",
  },
] as const;

export function LandingFAQ() {
  return (
    <section id="faq" className="border-t border-border/50 bg-muted/10 py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Frequently Asked Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Everything you need to know.
          </h2>
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
            Clear, honest answers about Formly's capabilities and design.
          </p>
        </div>

        {/* Accessible FAQ Accordion */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-8 shadow-xs">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`} className="border-border/60">
                <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground hover:no-underline py-4 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

