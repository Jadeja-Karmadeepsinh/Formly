"use client";

import * as React from "react";
import {
  IconAlignLeft,
  IconArrowsSort,
  IconBlockquote,
  IconCalendar,
  IconCheckbox,
  IconCircleDot,
  IconClock,
  IconCode,
  IconFileText,
  IconH1,
  IconH2,
  IconH3,
  IconHash,
  IconLink,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMail,
  IconMinus,
  IconPhone,
  IconStar,
  IconTypography,
} from "@tabler/icons-react";
export type FormElementType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "dropdown"
  | "checkbox"
  | "phone"
  | "website_url"
  | "date"
  | "time"
  | "linear_rating"
  | "star_rating"
  | "ranking"
  | "heading"
  | "paragraph"
  | "divider";

export interface FormElementOption {
  id?: string;
  label: string;
  value: string;
}

export interface QuestionTypeDefinition {
  type: FormElementType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  defaultLabel: string;
  defaultPlaceholder?: string;
  defaultHelpText?: string;
  defaultConfig: Record<string, unknown>;
  defaultValidationRules: Record<string, unknown>;
  hasOptions?: boolean;
  hasPlaceholder?: boolean;
  hasRatingScale?: boolean;
  hasNumberBounds?: boolean;
  hasTextValidation?: boolean;
}

export const QUESTION_TYPES: Record<string, QuestionTypeDefinition> = {
  short_text: {
    type: "short_text",
    label: "Short Text",
    description: "Single-line text for names, short answers, or titles",
    icon: IconAlignLeft,
    keywords: ["text", "short", "string", "name", "input", "title"],
    defaultLabel: "Untitled Question",
    defaultPlaceholder: "Short answer text",
    defaultConfig: {},
    defaultValidationRules: {},
    hasPlaceholder: true,
    hasTextValidation: true,
  },
  long_text: {
    type: "long_text",
    label: "Long Text",
    description: "Multi-line text area for feedback, messages, or descriptions",
    icon: IconFileText,
    keywords: ["long", "paragraph", "textarea", "feedback", "comment", "message"],
    defaultLabel: "Detailed Response",
    defaultPlaceholder: "Type your detailed answer here...",
    defaultConfig: { rows: 3 },
    defaultValidationRules: {},
    hasPlaceholder: true,
    hasTextValidation: true,
  },
  email: {
    type: "email",
    label: "Email",
    description: "Email address input with format validation",
    icon: IconMail,
    keywords: ["email", "mail", "contact", "@", "address"],
    defaultLabel: "Email Address",
    defaultPlaceholder: "name@example.com",
    defaultConfig: {},
    defaultValidationRules: {},
    hasPlaceholder: true,
  },
  number: {
    type: "number",
    label: "Number",
    description: "Numeric input with min, max, and step controls",
    icon: IconHash,
    keywords: ["number", "count", "amount", "quantity", "age", "integer"],
    defaultLabel: "Number / Quantity",
    defaultPlaceholder: "0",
    defaultConfig: { min: 0, step: 1 },
    defaultValidationRules: {},
    hasPlaceholder: true,
    hasNumberBounds: true,
  },
  single_select: {
    type: "single_select",
    label: "Single Select",
    description: "Multiple choice with radio buttons (pick one)",
    icon: IconCircleDot,
    keywords: ["radio", "choice", "single", "select", "one", "option"],
    defaultLabel: "Select one option",
    defaultConfig: {
      options: [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ],
    },
    defaultValidationRules: {},
    hasOptions: true,
  },
  multi_select: {
    type: "multi_select",
    label: "Multi Select",
    description: "Multiple choice with checkboxes (pick multiple)",
    icon: IconListCheck,
    keywords: ["checkbox", "multi", "select", "all", "choices", "many"],
    defaultLabel: "Select all that apply",
    defaultConfig: {
      options: [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ],
    },
    defaultValidationRules: {},
    hasOptions: true,
  },
  dropdown: {
    type: "dropdown",
    label: "Dropdown",
    description: "Compact dropdown menu for selecting an option",
    icon: IconCircleDot,
    keywords: ["dropdown", "select", "menu", "list", "options"],
    defaultLabel: "Choose an option",
    defaultConfig: {
      options: [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ],
    },
    defaultValidationRules: {},
    hasOptions: true,
  },
  checkbox: {
    type: "checkbox",
    label: "Checkbox",
    description: "Agreement or single confirmation checkbox",
    icon: IconCheckbox,
    keywords: ["checkbox", "agree", "terms", "consent", "confirm", "boolean"],
    defaultLabel: "Consent / Agreement",
    defaultPlaceholder: "I agree to the terms and conditions",
    defaultConfig: {},
    defaultValidationRules: {},
    hasPlaceholder: true,
  },
  phone: {
    type: "phone",
    label: "Phone Number",
    description: "Phone number input field",
    icon: IconPhone,
    keywords: ["phone", "tel", "mobile", "cell", "call", "sms"],
    defaultLabel: "Phone Number",
    defaultPlaceholder: "+1 (555) 000-0000",
    defaultConfig: {},
    defaultValidationRules: {},
    hasPlaceholder: true,
  },
  website_url: {
    type: "website_url",
    label: "Website URL",
    description: "Web address or website link input",
    icon: IconLink,
    keywords: ["website", "url", "link", "web", "http", "domain"],
    defaultLabel: "Website URL",
    defaultPlaceholder: "https://example.com",
    defaultConfig: {},
    defaultValidationRules: {},
    hasPlaceholder: true,
  },
  date: {
    type: "date",
    label: "Date",
    description: "Date picker selection",
    icon: IconCalendar,
    keywords: ["date", "calendar", "day", "birth", "appointment", "schedule"],
    defaultLabel: "Date",
    defaultConfig: {},
    defaultValidationRules: {},
  },
  time: {
    type: "time",
    label: "Time",
    description: "Time of day selection",
    icon: IconClock,
    keywords: ["time", "clock", "hour", "minute", "schedule"],
    defaultLabel: "Time",
    defaultConfig: {},
    defaultValidationRules: {},
  },
  linear_rating: {
    type: "linear_rating",
    label: "Linear Scale",
    description: "Numbered rating scale (e.g. 1 to 10)",
    icon: IconStar,
    keywords: ["scale", "rating", "nps", "linear", "score", "1-10", "numbers"],
    defaultLabel: "On a scale of 1-10, how likely are you to recommend us?",
    defaultConfig: {
      max: 10,
      minLabel: "Not likely",
      maxLabel: "Very likely",
    },
    defaultValidationRules: {},
    hasRatingScale: true,
  },
  star_rating: {
    type: "star_rating",
    label: "Star Rating",
    description: "Rating score using visual stars (1 to 5)",
    icon: IconStar,
    keywords: ["star", "rating", "review", "score", "stars", "feedback"],
    defaultLabel: "How would you rate your experience?",
    defaultConfig: { max: 5 },
    defaultValidationRules: {},
    hasRatingScale: true,
  },
  ranking: {
    type: "ranking",
    label: "Ranking",
    description: "Allow respondents to reorder choices by priority",
    icon: IconArrowsSort,
    keywords: ["rank", "order", "sort", "preference", "priority", "ranking"],
    defaultLabel: "Rank the following in order of preference",
    defaultConfig: {
      options: [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
        { label: "Option 3", value: "option_3" },
      ],
    },
    defaultValidationRules: {},
    hasOptions: true,
  },
};

export const QUESTION_TYPES_LIST = Object.values(QUESTION_TYPES);

export function getQuestionTypeDefinition(type: string): QuestionTypeDefinition {
  return (
    QUESTION_TYPES[type] || {
      type: type as FormElementType,
      label: type,
      description: "Custom question block",
      icon: IconFileText,
      keywords: [type],
      defaultLabel: "Untitled Question",
      defaultConfig: {},
      defaultValidationRules: {},
    }
  );
}
