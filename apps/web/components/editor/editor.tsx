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
  useFormFields,
  useSyncFormFields,
} from "~/hooks/api/form-field";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { EditorHeader, type SaveStatus } from "./components/editor-header";
import { EditorBubbleMenu } from "./components/bubble-menu";
import { BlockGutter } from "./components/block-gutter";
import { FormFieldNode } from "./nodes/form-field-node";
import { SlashCommand } from "./extensions/slash-command";
import {
  type InsertFormFieldPayload,
} from "./components/slash-command-menu";
import {
  PropertiesPanel,
  type PropertiesFieldData,
} from "./components/properties-panel";
import { PublishDialog } from "./components/publish-dialog";
import {
  FormPreviewModal,
  type PreviewFieldData,
} from "./components/preview-modal";
import { ShortcutsDialog } from "./components/shortcuts-dialog";
import { EditorEmptyState } from "./components/empty-state";

interface FormEditorProps {
  formId: string;
}

export function FormEditor({ formId }: FormEditorProps) {
  const { form, isLoading: isFormLoading, isError: isFormError } = useForm(
    formId
  );
  const { fields, isLoading: isFieldsLoading } = useFormFields(formId);

  const { updateFormAsync } = useUpdateForm();
  const { syncFormFieldsAsync } = useSyncFormFields(formId);

  // Manual save state
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("saved");
  const [isDirty, setIsDirty] = React.useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);

  // Undo / Redo tracking
  const [canUndo, setCanUndo] = React.useState<boolean>(false);
  const [canRedo, setCanRedo] = React.useState<boolean>(false);

  // Form Metadata
  const [formTitle, setFormTitle] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formStatus, setFormStatus] = React.useState<string>("draft");

  // Dialog and Inspector States
  const [selectedField, setSelectedField] =
    React.useState<PropertiesFieldData | null>(null);
  const [isPropertiesOpen, setIsPropertiesOpen] = React.useState(false);
  const [isPublishOpen, setIsPublishOpen] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false);

  // Field count tracker for validation & empty state
  const [questionCount, setQuestionCount] = React.useState<number>(0);

  const isInitialLoadedRef = React.useRef(false);

  // Sync form initial metadata
  React.useEffect(() => {
    if (form) {
      setFormTitle(form.title || "");
      setFormDescription(form.description || "");
      setFormStatus(form.status || "draft");
    }
  }, [form]);

  // Unsaved changes protection
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Mark draft as dirty
  const markDirty = React.useCallback(() => {
    setIsDirty(true);
    setSaveStatus("unsaved");
  }, []);

  // Update question count in editor
  const refreshQuestionCount = React.useCallback((ed: any) => {
    if (!ed) return;
    let count = 0;
    ed.state.doc.descendants((node: any) => {
      if (node.type.name === "formField") {
        count++;
      }
    });
    setQuestionCount(count);
  }, []);

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
        placeholder: "Type '/' to insert questions or format text...",
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
        onInsertFormField: (field: InsertFormFieldPayload) => {
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
    onTransaction: ({ editor: ed }) => {
      setCanUndo(ed.can().undo());
      setCanRedo(ed.can().redo());
    },
    onUpdate: ({ editor: ed }) => {
      if (!isInitialLoadedRef.current) return;
      markDirty();
      refreshQuestionCount(ed);
      setCanUndo(ed.can().undo());
      setCanRedo(ed.can().redo());
    },
  });

  // Explicit action: Open the settings sidebar for a specific question (Gear button / settings action)
  const handleOpenSettings = React.useCallback(
    (fieldData: PropertiesFieldData) => {
      setSelectedField(fieldData);
      setIsPropertiesOpen(true);
    },
    []
  );

  // Question selection / focus: Selects the question block WITHOUT opening the sidebar
  const handleSelectField = React.useCallback(
    (fieldData: PropertiesFieldData) => {
      setSelectedField(fieldData);
      // NOTE: Does NOT open properties sidebar!
    },
    []
  );

  // Inline update of a question's attributes from the canvas: keeps selectedField in sync if sidebar is open
  const handleFieldInlineUpdate = React.useCallback(
    (fieldId: string, updates: Partial<PropertiesFieldData>) => {
      setSelectedField((prev) =>
        prev?.fieldId === fieldId ? { ...prev, ...updates } : prev
      );
      markDirty();
    },
    [markDirty]
  );

  // Handle deleting a field from local draft
  const handleDeleteField = React.useCallback(
    (fieldId: string) => {
      if (!editor) return;

      editor.commands.command(({ tr, state }) => {
        state.doc.descendants((node, pos) => {
          if (node.type.name === "formField" && node.attrs.fieldId === fieldId) {
            tr.delete(pos, pos + node.nodeSize);
            return false;
          }
        });
        return true;
      });

      if (selectedField?.fieldId === fieldId) {
        setSelectedField(null);
        setIsPropertiesOpen(false);
      }

      markDirty();
      refreshQuestionCount(editor);
      toast.info("Question removed from draft");
    },
    [editor, selectedField, markDirty, refreshQuestionCount]
  );

  // Attach storage handlers for NodeViews
  React.useEffect(() => {
    if (editor) {
      (
        editor.storage as {
          formly?: {
            onOpenSettings?: (data: PropertiesFieldData) => void;
            onSelectField?: (data: PropertiesFieldData) => void;
            onFieldInlineUpdate?: (
              fieldId: string,
              updates: Partial<PropertiesFieldData>
            ) => void;
            onFieldDeleted?: (id: string) => void;
          };
        }
      ).formly = {
        onOpenSettings: handleOpenSettings,
        onSelectField: handleSelectField,
        onFieldInlineUpdate: handleFieldInlineUpdate,
        onFieldDeleted: handleDeleteField,
      };
    }
  }, [
    editor,
    handleOpenSettings,
    handleSelectField,
    handleFieldInlineUpdate,
    handleDeleteField,
  ]);

  // Insert a new form field into the local draft
  const handleInsertField = React.useCallback(
    (field: InsertFormFieldPayload) => {
      if (!editor) return;

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const newFieldData: PropertiesFieldData = {
        fieldId: tempId,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || null,
        helpText: field.helpText || null,
        required: false,
        config: field.config || {},
        validationRules: field.validationRules || {},
      };

      editor
        .chain()
        .focus()
        .insertContent({
          type: "formField",
          attrs: newFieldData,
        })
        .run();

      markDirty();
      refreshQuestionCount(editor);

      // Track newly inserted question without automatically opening the settings sidebar
      setSelectedField(newFieldData);
    },
    [editor, markDirty, refreshQuestionCount]
  );

  // Update a field's attributes from the Properties Inspector
  const handleUpdateField = React.useCallback(
    (fieldId: string, updates: Partial<PropertiesFieldData>) => {
      if (!editor) return;

      editor.commands.command(({ tr, state }) => {
        state.doc.descendants((node, pos) => {
          if (node.type.name === "formField" && node.attrs.fieldId === fieldId) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              ...updates,
            });
            return false;
          }
        });
        return true;
      });

      setSelectedField((prev) => (prev ? { ...prev, ...updates } : null));
      markDirty();
    },
    [editor, markDirty]
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
      editor.commands.setContent(docContent, { emitUpdate: false });
    } else if (fields && fields.length > 0) {
      const content: JSONContent[] = [];

      if (form?.description) {
        content.push({
          type: "paragraph",
          content: [{ type: "text", text: form.description }],
        });
      }

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

    refreshQuestionCount(editor);
    isInitialLoadedRef.current = true;
    setIsDirty(false);
    setSaveStatus("saved");
  }, [editor, form, fields, isFormLoading, isFieldsLoading, refreshQuestionCount]);

  // Handle title & description changes (local draft only!)
  const handleTitleChange = (newTitle: string) => {
    setFormTitle(newTitle);
    markDirty();
  };

  const handleDescriptionChange = (newDesc: string) => {
    setFormDescription(newDesc);
    markDirty();
  };

  // EXPLICIT SAVE CHANGES HANDLER (NO AUTOSAVE!)
  const handleSaveChanges = React.useCallback(async (): Promise<boolean> => {
    if (!editor) return false;

    setSaveStatus("saving");

    try {
      // 1. Extract all question nodes from the Tiptap document in their visual order
      const fieldsToSync: Array<{
        id?: string;
        kind: "question" | "content";
        type: any;
        label?: string | null;
        content?: string | null;
        helpText?: string | null;
        placeholder?: string | null;
        required: boolean;
        sortOrder: number;
        config: Record<string, unknown>;
        validationRules: Record<string, unknown>;
      }> = [];

      editor.state.doc.descendants((node) => {
        if (node.type.name === "formField") {
          const attrs = node.attrs;
          const isTempId = !attrs.fieldId || String(attrs.fieldId).startsWith("temp_");
          fieldsToSync.push({
            id: isTempId ? undefined : attrs.fieldId,
            kind: attrs.kind || "question",
            type: attrs.type,
            label: attrs.label ?? "",
            content: attrs.content ?? null,
            helpText: attrs.helpText ?? null,
            placeholder: attrs.placeholder ?? null,
            required: Boolean(attrs.required),
            sortOrder: fieldsToSync.length,
            config: attrs.config || {},
            validationRules: attrs.validationRules || {},
          });
        }
      });

      // 2. Perform transactional batch sync of fields and form document metadata
      const [savedFields] = await Promise.all([
        syncFormFieldsAsync({
          formId,
          fields: fieldsToSync,
        }),
        updateFormAsync({
          id: formId,
          title: formTitle.trim() || "Untitled Form",
          description: formDescription.trim() || null,
          settings: {
            ...(typeof form?.settings === "object" && form.settings !== null
              ? form.settings
              : {}),
            documentContent: editor.getJSON(),
          },
        }),
      ]);

      // 3. Update in-editor node IDs with the persisted DB IDs
      if (Array.isArray(savedFields)) {
        let fieldIndex = 0;
        editor.commands.command(({ tr, state }) => {
          state.doc.descendants((node, pos) => {
            if (node.type.name === "formField") {
              const matchedDbField = savedFields[fieldIndex];
              if (matchedDbField && node.attrs.fieldId !== matchedDbField.id) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  fieldId: matchedDbField.id,
                });
              }
              fieldIndex++;
            }
          });
          return true;
        });
      }

      setIsDirty(false);
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      toast.success("All changes saved successfully");
      return true;
    } catch (err: unknown) {
      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Failed to save changes";
      toast.error(msg);
      return false;
    }
  }, [
    editor,
    formId,
    formTitle,
    formDescription,
    form?.settings,
    syncFormFieldsAsync,
    updateFormAsync,
  ]);

  // Open Full-Page Preview in a New Browser Tab with Current Local Draft
  const handleOpenPreview = React.useCallback(() => {
    if (!editor) return;

    const draftFields: PreviewFieldData[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "formField") {
        draftFields.push(node.attrs as PreviewFieldData);
      }
    });

    const draftData = {
      title: formTitle || form?.title || "Untitled Form",
      description: formDescription || form?.description || "",
      fields: draftFields,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem(
        `formly_preview_draft_${formId}`,
        JSON.stringify(draftData)
      );
    } catch (e) {
      console.error("Failed to store preview draft in sessionStorage", e);
    }

    window.open(`/dashboard/forms/${formId}/preview`, "_blank");
  }, [
    editor,
    formTitle,
    formDescription,
    form?.title,
    form?.description,
    formId,
  ]);

  // Global Keyboard Shortcuts (Ctrl/Cmd + S to save, Ctrl/Cmd + P to preview)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveChanges();
      } else if (isMod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleOpenPreview();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveChanges, handleOpenPreview]);

  // Extract preview fields from current editor state
  const getPreviewFields = (): PreviewFieldData[] => {
    if (!editor) return [];
    const result: PreviewFieldData[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "formField") {
        result.push(node.attrs as PreviewFieldData);
      }
    });
    return result;
  };

  if (isFormLoading || isFieldsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="h-13 border-b flex items-center px-4 justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="max-w-[700px] w-full mx-auto p-8 space-y-6">
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
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Tally-style Header with Undo/Redo, Manual Save & Publish */}
      <EditorHeader
        formId={formId}
        title={formTitle || form.title}
        shareId={form.shareId}
        status={formStatus}
        saveStatus={saveStatus}
        isDirty={isDirty}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => editor?.commands.undo()}
        onRedo={() => editor?.commands.redo()}
        onSave={handleSaveChanges}
        onOpenPreview={handleOpenPreview}
        onOpenPublish={() => setIsPublishOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Floating Text Formatting Menu */}
      <EditorBubbleMenu editor={editor} />

      {/* Document Canvas (Tally-inspired writing width) */}
      <main className="flex-1 w-full max-w-[700px] mx-auto px-6 sm:px-8 py-10 md:py-16">
        {/* Editable Form Title */}
        <input
          type="text"
          value={formTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Form"
          className="w-full text-3xl sm:text-4xl font-bold tracking-tight bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground/30 mb-2"
        />

        {/* Editable Form Description */}
        <textarea
          value={formDescription}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Add a form description or instructions for respondents..."
          rows={1}
          className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none focus:outline-none resize-none placeholder:text-muted-foreground/30 mb-6 leading-relaxed"
        />

        <div className="h-px bg-border/40 w-full mb-6" />

        {/* Onboarding Empty State when no questions exist */}
        {questionCount === 0 && (
          <EditorEmptyState
            onInsertField={handleInsertField}
            onFocusEditor={() => editor?.commands.focus()}
          />
        )}

        {/* Continuous Tiptap Canvas with Floating Block Gutter */}
        <div className="notion-editor-canvas relative min-h-[400px]">
          <BlockGutter
            editor={editor}
            onInsertField={handleInsertField}
            onOpenProperties={(fieldData) => {
              if (fieldData) {
                setSelectedField(fieldData);
              }
              setIsPropertiesOpen(true);
            }}
          />
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Contextual Properties Inspector (Slide-over Sheet) */}
      <PropertiesPanel
        open={isPropertiesOpen}
        onOpenChange={setIsPropertiesOpen}
        field={selectedField}
        onUpdateField={handleUpdateField}
        onDeleteField={handleDeleteField}
      />

      {/* Publish Dialog */}
      <PublishDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        formId={formId}
        shareId={form.shareId}
        title={formTitle || form.title}
        fieldCount={questionCount}
        isDirty={isDirty}
        status={formStatus}
        onSaveDraft={handleSaveChanges}
        onPublishedChange={(newStatus) => setFormStatus(newStatus)}
      />

      {/* Respondent Preview Modal */}
      <FormPreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={formTitle || form.title}
        description={formDescription || form.description || ""}
        fields={getPreviewFields()}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsDialog
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </div>
  );
}
