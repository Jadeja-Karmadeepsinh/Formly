"use client";

import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import { toast } from "sonner";
import { useForm, useUpdateForm } from "~/hooks/api/form";
import {
  useCreateFormField,
  useDeleteFormField,
  useFormFields,
  useReorderFormFields,
  useUpdateFormField,
} from "~/hooks/api/form-field";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { EditorHeader, type SaveStatus } from "./components/editor-header";
import { EditorBubbleMenu } from "./components/bubble-menu";
import { FormFieldNode } from "./nodes/form-field-node";
import { SlashCommand } from "./extensions/slash-command";
import { type FieldSettingsData } from "./components/form-field-settings-dialog";

interface FormEditorProps {
  formId: string;
}

export function FormEditor({ formId }: FormEditorProps) {
  const { form, isLoading: isFormLoading, isError: isFormError } = useForm(
    formId
  );
  const { fields, isLoading: isFieldsLoading } = useFormFields(formId);

  const { createFormFieldAsync } = useCreateFormField(formId);
  const { updateFormFieldAsync } = useUpdateFormField(formId);
  const { deleteFormFieldAsync } = useDeleteFormField(formId);
  const { reorderFormFieldsAsync } = useReorderFormFields(formId);
  const { updateFormAsync } = useUpdateForm();

  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);

  // Form title state
  const [formTitle, setFormTitle] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");

  React.useEffect(() => {
    if (form) {
      setFormTitle(form.title || "");
      setFormDescription(form.description || "");
    }
  }, [form]);

  // Track field order to avoid redundant reorder calls
  const lastOrderedIdsRef = React.useRef<string[]>([]);
  const isInitialLoadedRef = React.useRef(false);
  const reorderTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const contentSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const titleSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handlers for FormFieldNode interactions
  const handleFieldUpdated = React.useCallback(
    async (fieldId: string, data: FieldSettingsData) => {
      setSaveStatus("saving");
      try {
        await updateFormFieldAsync({
          formId,
          id: fieldId,
          ...data,
        });
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    },
    [formId, updateFormFieldAsync]
  );

  const handleFieldDeleted = React.useCallback(
    async (fieldId: string) => {
      setSaveStatus("saving");
      try {
        await deleteFormFieldAsync({
          formId,
          id: fieldId,
        });
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    },
    [formId, deleteFormFieldAsync]
  );

  // Initialize Tiptap editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Type '/' to insert form questions or formatting...",
        emptyEditorClass: "is-editor-empty",
      }),
      Typography,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      FormFieldNode,
      SlashCommand.configure({
        onInsertFormField: (field: {
          type: string;
          label: string;
          placeholder?: string;
          config?: Record<string, unknown>;
        }) => {
          handleInsertField(field);
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px] text-base leading-relaxed",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (!isInitialLoadedRef.current) return;

      setSaveStatus("unsaved");

      // 1. Detect field order changes
      const currentFieldIds: string[] = [];
      ed.state.doc.descendants((node) => {
        if (node.type.name === "formField" && node.attrs.fieldId) {
          currentFieldIds.push(node.attrs.fieldId);
        }
      });

      const prevIds = lastOrderedIdsRef.current;
      const orderChanged =
        currentFieldIds.length === prevIds.length &&
        currentFieldIds.some((id, index) => id !== prevIds[index]);

      if (orderChanged && currentFieldIds.length > 0) {
        lastOrderedIdsRef.current = currentFieldIds;
        if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current);
        reorderTimeoutRef.current = setTimeout(async () => {
          try {
            setSaveStatus("saving");
            await reorderFormFieldsAsync({
              formId,
              fieldIds: currentFieldIds,
            });
            setSaveStatus("saved");
            setLastSavedAt(new Date());
          } catch {
            setSaveStatus("error");
          }
        }, 800);
      }

      // 2. Autosave rich text document content
      if (contentSaveTimeoutRef.current) {
        clearTimeout(contentSaveTimeoutRef.current);
      }
      contentSaveTimeoutRef.current = setTimeout(async () => {
        try {
          setSaveStatus("saving");
          const jsonContent = ed.getJSON();
          await updateFormAsync({
            id: formId,
            settings: {
              ...(typeof form?.settings === "object" && form.settings !== null
                ? form.settings
                : {}),
              documentContent: jsonContent,
            },
          });
          setSaveStatus("saved");
          setLastSavedAt(new Date());
        } catch {
          setSaveStatus("error");
        }
      }, 1500);
    },
  });

  // Attach custom handlers to editor storage so NodeViews can access them
  React.useEffect(() => {
    if (editor) {
      (
        editor.storage as {
          formly?: {
            onFieldUpdated?: (id: string, d: FieldSettingsData) => void;
            onFieldDeleted?: (id: string) => void;
          };
        }
      ).formly = {
        onFieldUpdated: handleFieldUpdated,
        onFieldDeleted: handleFieldDeleted,
      };
    }
  }, [editor, handleFieldUpdated, handleFieldDeleted]);

  // Insert a new form field into the editor and backend
  const handleInsertField = React.useCallback(
    async (field: {
      type: string;
      label: string;
      placeholder?: string;
      config?: Record<string, unknown>;
    }) => {
      if (!editor) return;

      setSaveStatus("saving");
      try {
        const created = await createFormFieldAsync({
          formId,
          type: field.type as Parameters<typeof createFormFieldAsync>[0]["type"],
          label: field.label,
          placeholder: field.placeholder || null,
          config: field.config || {},
          required: false,
        });

        // Insert node into editor at current selection or end
        editor
          .chain()
          .focus()
          .insertContent({
            type: "formField",
            attrs: {
              fieldId: created.id,
              kind: created.kind,
              type: created.type,
              label: created.label,
              helpText: created.helpText,
              placeholder: created.placeholder,
              required: created.required,
              config: created.config || {},
              validationRules: created.validationRules || {},
            },
          })
          .run();

        // Update tracked field IDs
        lastOrderedIdsRef.current = [
          ...lastOrderedIdsRef.current,
          created.id,
        ];

        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch (err: unknown) {
        setSaveStatus("error");
        const msg = err instanceof Error ? err.message : "Failed to create field";
        toast.error(msg);
      }
    },
    [editor, formId, createFormFieldAsync]
  );

  // Initial Content Load & Hydration
  React.useEffect(() => {
    if (!editor || isInitialLoadedRef.current || isFormLoading || isFieldsLoading) {
      return;
    }

    const docContent = (
      form?.settings as Record<string, unknown> | null | undefined
    )?.documentContent as JSONContent | undefined;

    if (docContent && docContent.content) {
      // Rehydrate existing document content
      editor.commands.setContent(docContent, { emitUpdate: false });
    } else if (fields && fields.length > 0) {
      // Construct initial document from existing database fields
      const content: JSONContent[] = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text:
                form?.description ||
                "Welcome to this form. Please fill out the details below.",
            },
          ],
        },
      ];

      for (const f of fields) {
        content.push({
          type: "formField",
          attrs: {
            fieldId: f.id,
            kind: f.kind,
            type: f.type,
            label: f.label,
            helpText: f.helpText,
            placeholder: f.placeholder,
            required: f.required,
            config: f.config || {},
            validationRules: f.validationRules || {},
          },
        });
      }

      editor.commands.setContent({ type: "doc", content }, { emitUpdate: false });
    } else {
      // Fresh clean empty form document
      editor.commands.setContent(
        {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text:
                    form?.description ||
                    "Type '/' to add questions, headings, or text blocks...",
                },
              ],
            },
          ],
        },
        { emitUpdate: false }
      );
    }

    // Set initial tracked order
    const initialIds: string[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "formField" && node.attrs.fieldId) {
        initialIds.push(node.attrs.fieldId as string);
      }
    });
    lastOrderedIdsRef.current = initialIds;
    isInitialLoadedRef.current = true;
  }, [editor, form, fields, isFormLoading, isFieldsLoading]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setFormTitle(newTitle);
    setSaveStatus("unsaved");

    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }
    titleSaveTimeoutRef.current = setTimeout(async () => {
      if (!newTitle.trim()) return;
      try {
        setSaveStatus("saving");
        await updateFormAsync({
          id: formId,
          title: newTitle.trim(),
        });
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    }, 1000);
  };

  // Handle description change
  const handleDescriptionChange = (newDesc: string) => {
    setFormDescription(newDesc);
    setSaveStatus("unsaved");

    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }
    titleSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await updateFormAsync({
          id: formId,
          description: newDesc.trim() || null,
        });
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    }, 1000);
  };

  if (isFormLoading || isFieldsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="h-14 border-b flex items-center px-4 justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="max-w-3xl w-full mx-auto p-8 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isFormError || !form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center">
        <h2 className="text-xl font-semibold">Form Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          The requested form could not be found or you do not have permission to view it.
        </p>
        <Button asChild variant="outline">
          <a href="/dashboard">Return to Forms</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Notion-style Header with Breadcrumb & Save Status */}
      <EditorHeader
        formId={formId}
        title={formTitle || form.title}
        shareId={form.shareId}
        status={form.status}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        onInsertField={handleInsertField}
      />

      {/* Floating Text Formatting Menu */}
      <EditorBubbleMenu editor={editor} />

      {/* Notion-style Editor Body */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10 md:py-16">
        {/* Editable Form Title */}
        <input
          type="text"
          value={formTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Form"
          className="w-full text-3xl md:text-4xl font-bold tracking-tight bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground/40 mb-3"
        />

        {/* Editable Form Description */}
        <textarea
          value={formDescription}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Add a form description or instructions for respondents..."
          rows={2}
          className="w-full text-base text-muted-foreground bg-transparent border-none outline-none focus:outline-none resize-none placeholder:text-muted-foreground/40 mb-6"
        />

        <div className="h-px bg-border/60 w-full mb-8" />

        {/* Tiptap Document Canvas */}
        <div className="notion-editor-canvas min-h-[500px]">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}
