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

export interface SlashMenuItem {
  title: string;
  description: string;
  category: "basic" | "form";
  icon: React.ComponentType<{ className?: string }>;
  command: (editor: unknown, range: { from: number; to: number }) => void;
}

export const getSlashMenuItems = (
  onInsertFormField: (field: {
    type: string;
    label: string;
    placeholder?: string;
    config?: Record<string, unknown>;
  }) => void
): SlashMenuItem[] => [
  // --- Form Fields ---
  {
    title: "Short Text",
    description: "Single-line text input for names, titles, or brief answers",
    category: "form",
    icon: IconAlignLeft,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "short_text",
        label: "Untitled Question",
        placeholder: "Short answer text",
      });
    },
  },
  {
    title: "Long Text",
    description: "Multi-line text area for feedback, messages, or paragraphs",
    category: "form",
    icon: IconFileText,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "long_text",
        label: "Detailed Response",
        placeholder: "Type detailed response here...",
      });
    },
  },
  {
    title: "Email Address",
    description: "Validates respondent email address format",
    category: "form",
    icon: IconMail,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "email",
        label: "Email Address",
        placeholder: "name@example.com",
      });
    },
  },
  {
    title: "Number",
    description: "Numeric input with min, max, and step controls",
    category: "form",
    icon: IconHash,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "number",
        label: "Number / Quantity",
        placeholder: "0",
      });
    },
  },
  {
    title: "Single Select",
    description: "Multiple choice with radio options (pick one)",
    category: "form",
    icon: IconCircleDot,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "single_select",
        label: "Select one option",
        config: {
          options: [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ],
        },
      });
    },
  },
  {
    title: "Multi Select",
    description: "Multiple choice checkboxes (pick multiple)",
    category: "form",
    icon: IconListCheck,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "multi_select",
        label: "Select all that apply",
        config: {
          options: [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ],
        },
      });
    },
  },
  {
    title: "Dropdown",
    description: "Select option from a compact dropdown list",
    category: "form",
    icon: IconCircleDot,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "dropdown",
        label: "Choose from dropdown",
        config: {
          options: [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ],
        },
      });
    },
  },
  {
    title: "Single Checkbox",
    description: "Agreement or boolean confirmation checkbox",
    category: "form",
    icon: IconCheckbox,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "checkbox",
        label: "Consent / Agreement",
        placeholder: "I agree to the terms and conditions",
      });
    },
  },
  {
    title: "Phone Number",
    description: "Phone number input field",
    category: "form",
    icon: IconPhone,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "phone",
        label: "Phone Number",
        placeholder: "+1 (555) 000-0000",
      });
    },
  },
  {
    title: "Website URL",
    description: "Web address / website link input",
    category: "form",
    icon: IconLink,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "website_url",
        label: "Website URL",
        placeholder: "https://example.com",
      });
    },
  },
  {
    title: "Date",
    description: "Date picker selection",
    category: "form",
    icon: IconCalendar,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "date",
        label: "Date",
      });
    },
  },
  {
    title: "Time",
    description: "Time of day selection",
    category: "form",
    icon: IconClock,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "time",
        label: "Time",
      });
    },
  },
  {
    title: "Star Rating",
    description: "Rating score using 5 or 10 visual stars",
    category: "form",
    icon: IconStar,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "star_rating",
        label: "How would you rate your experience?",
        config: { max: 5 },
      });
    },
  },
  {
    title: "Linear Scale",
    description: "Numbered rating scale (e.g. 1 to 10)",
    category: "form",
    icon: IconStar,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "linear_rating",
        label: "On a scale of 1-10, how likely are you to recommend us?",
        config: { max: 10 },
      });
    },
  },
  {
    title: "Ranking",
    description: "Allow respondents to reorder and rank choices",
    category: "form",
    icon: IconArrowsSort,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { run: () => void } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .run();
      onInsertFormField({
        type: "ranking",
        label: "Rank the following in order of preference",
        config: {
          options: [
            { label: "First priority", value: "opt_1" },
            { label: "Second priority", value: "opt_2" },
            { label: "Third priority", value: "opt_3" },
          ],
        },
      });
    },
  },

  // --- Basic Blocks ---
  {
    title: "Text",
    description: "Plain text paragraph for instructions or descriptions",
    category: "basic",
    icon: IconTypography,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { setParagraph: () => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .setParagraph()
        .run();
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    category: "basic",
    icon: IconH1,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { setNode: (n: string, a: unknown) => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    category: "basic",
    icon: IconH2,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { setNode: (n: string, a: unknown) => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    category: "basic",
    icon: IconH3,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { setNode: (n: string, a: unknown) => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create an unordered bulleted list",
    category: "basic",
    icon: IconList,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { toggleBulletList: () => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run();
    },
  },
  {
    title: "Numbered List",
    description: "Create an ordered numbered list",
    category: "basic",
    icon: IconListNumbers,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { toggleOrderedList: () => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run();
    },
  },
  {
    title: "Task List",
    description: "Checklist with to-do items",
    category: "basic",
    icon: IconListCheck,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { toggleTaskList: () => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .toggleTaskList()
        .run();
    },
  },
  {
    title: "Quote",
    description: "Capture a callout or quote",
    category: "basic",
    icon: IconBlockquote,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { toggleBlockquote: () => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: "Code Block",
    description: "Display code snippet with syntax highlighting",
    category: "basic",
    icon: IconCode,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { toggleCodeBlock: () => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCodeBlock()
        .run();
    },
  },
  {
    title: "Divider",
    description: "Visual horizontal line separator",
    category: "basic",
    icon: IconMinus,
    command: (editor, range) => {
      (editor as { chain: () => { focus: () => { deleteRange: (r: unknown) => { setHorizontalRule: () => { run: () => void } } } } })
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run();
    },
  },
];

interface SlashCommandMenuProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
  selectedIndex: number;
}

export const SlashCommandMenu = React.forwardRef<
  HTMLDivElement,
  SlashCommandMenuProps
>(({ items, command, selectedIndex }, ref) => {
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [selectedIndex]);

  if (items.length === 0) {
    return (
      <div
        ref={ref}
        className="z-50 w-72 rounded-lg border bg-popover p-2 text-xs text-muted-foreground shadow-md"
      >
        No results found
      </div>
    );
  }

  // Group by category
  const formItems = items.filter((i) => i.category === "form");
  const basicItems = items.filter((i) => i.category === "basic");

  let globalIndex = 0;

  return (
    <div
      ref={ref}
      className="z-50 w-80 max-h-80 overflow-y-auto rounded-lg border bg-popover p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95"
    >
      {formItems.length > 0 && (
        <div className="mb-2">
          <div className="px-2 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
            Form Questions
          </div>
          <div className="space-y-0.5">
            {formItems.map((item) => {
              const currIndex = globalIndex++;
              const isSelected = currIndex === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  ref={(el) => {
                    itemRefs.current[currIndex] = el;
                  }}
                  type="button"
                  onClick={() => command(item)}
                  className={`flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <div className="mt-0.5 rounded border bg-background p-1 text-muted-foreground shrink-0">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {basicItems.length > 0 && (
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Content Blocks
          </div>
          <div className="space-y-0.5">
            {basicItems.map((item) => {
              const currIndex = globalIndex++;
              const isSelected = currIndex === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  ref={(el) => {
                    itemRefs.current[currIndex] = el;
                  }}
                  type="button"
                  onClick={() => command(item)}
                  className={`flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <div className="mt-0.5 rounded border bg-background p-1 text-muted-foreground shrink-0">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

SlashCommandMenu.displayName = "SlashCommandMenu";
