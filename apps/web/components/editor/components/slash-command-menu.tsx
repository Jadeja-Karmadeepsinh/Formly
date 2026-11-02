"use client";

import * as React from "react";
import {
  IconBlockquote,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMinus,
  IconTypography,
} from "@tabler/icons-react";
import {
  QUESTION_TYPES_LIST,
  type QuestionTypeDefinition,
} from "../registry/question-registry";

export interface InsertFormFieldPayload {
  type: string;
  label: string;
  placeholder?: string | null;
  helpText?: string | null;
  required?: boolean;
  config?: Record<string, unknown>;
  validationRules?: Record<string, unknown>;
  fieldId?: string;
}

export type InsertFormFieldCallback = (field: InsertFormFieldPayload) => void;

export interface SlashMenuItem {
  title: string;
  description: string;
  category: "form" | "basic";
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  command: (editor: unknown, range: { from: number; to: number }) => void;
}

export const getSlashMenuItems = (
  onInsertFormField?: InsertFormFieldCallback
): SlashMenuItem[] => {
  // 1. Build question items dynamically from central Question Registry
  const questionItems: SlashMenuItem[] = QUESTION_TYPES_LIST.map((qDef) => ({
    title: qDef.label,
    description: qDef.description,
    category: "form",
    icon: qDef.icon,
    keywords: qDef.keywords,
    command: (editor: unknown, range: { from: number; to: number }) => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const fieldData = {
        fieldId: tempId,
        type: qDef.type,
        label: qDef.defaultLabel,
        placeholder: qDef.defaultPlaceholder || null,
        helpText: qDef.defaultHelpText || null,
        required: false,
        config: qDef.defaultConfig || {},
        validationRules: qDef.defaultValidationRules || {},
      };

      const ed = editor as {
        chain: () => {
          focus: () => {
            deleteRange: (r: unknown) => {
              insertContent: (content: unknown) => { run: () => void };
            };
          };
        };
      };

      ed.chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "formField",
          attrs: fieldData,
        })
        .run();

      if (typeof onInsertFormField === "function") {
        onInsertFormField(fieldData);
      }
    },
  }));

  // 2. Document content blocks
  const contentItems: SlashMenuItem[] = [
    {
      title: "Text",
      description: "Plain text paragraph for instructions or descriptions",
      category: "basic",
      icon: IconTypography,
      keywords: ["text", "paragraph", "plain", "p"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                setParagraph: () => { run: () => void };
              };
            };
          };
        })
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
      keywords: ["h1", "heading", "title", "large"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                setNode: (n: string, a: unknown) => { run: () => void };
              };
            };
          };
        })
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
      keywords: ["h2", "heading", "subtitle", "medium"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                setNode: (n: string, a: unknown) => { run: () => void };
              };
            };
          };
        })
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
      keywords: ["h3", "heading", "small"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                setNode: (n: string, a: unknown) => { run: () => void };
              };
            };
          };
        })
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
      keywords: ["bullet", "list", "ul", "point"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                toggleBulletList: () => { run: () => void };
              };
            };
          };
        })
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
      keywords: ["number", "numbered", "list", "ol", "1."],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                toggleOrderedList: () => { run: () => void };
              };
            };
          };
        })
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
      keywords: ["task", "todo", "checkbox", "checklist"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                toggleTaskList: () => { run: () => void };
              };
            };
          };
        })
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
      keywords: ["quote", "blockquote", "callout"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                toggleBlockquote: () => { run: () => void };
              };
            };
          };
        })
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBlockquote()
          .run();
      },
    },
    {
      title: "Code Block",
      description: "Display formatted code snippet",
      category: "basic",
      icon: IconCode,
      keywords: ["code", "snippet", "pre"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                toggleCodeBlock: () => { run: () => void };
              };
            };
          };
        })
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
      keywords: ["divider", "line", "separator", "hr"],
      command: (editor, range) => {
        (editor as {
          chain: () => {
            focus: () => {
              deleteRange: (r: unknown) => {
                setHorizontalRule: () => { run: () => void };
              };
            };
          };
        })
          .chain()
          .focus()
          .deleteRange(range)
          .setHorizontalRule()
          .run();
      },
    },
  ];

  return [...questionItems, ...contentItems];
};

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
        className="z-50 w-72 rounded-xl border bg-popover/95 p-3 text-xs text-muted-foreground shadow-xl backdrop-blur-md"
      >
        No matching blocks or questions
      </div>
    );
  }

  const formItems = items.filter((i) => i.category === "form");
  const basicItems = items.filter((i) => i.category === "basic");

  let globalIndex = 0;

  return (
    <div
      ref={ref}
      className="z-50 w-80 max-h-84 overflow-y-auto rounded-xl border bg-popover/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95"
    >
      {formItems.length > 0 && (
        <div className="mb-2">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-primary uppercase tracking-wider">
            Questions
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    command(item);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    command(item);
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="mt-0.5 rounded-md border bg-background p-1 text-muted-foreground shrink-0 shadow-2xs">
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
          <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    command(item);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    command(item);
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="mt-0.5 rounded-md border bg-background p-1 text-muted-foreground shrink-0 shadow-2xs">
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
