"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import {
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconHighlight,
  IconItalic,
  IconLink,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  React.useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { from, to, empty } = editor.state.selection;

      // Only show when text is selected and editor is focused
      if (empty || from === to || !editor.isFocused) {
        setIsVisible(false);
        return;
      }

      // Check if selection is within a formField node (we don't show bubble menu for field atoms)
      const isFieldSelected = editor.isActive("formField");
      if (isFieldSelected) {
        setIsVisible(false);
        return;
      }

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        setIsVisible(false);
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        setIsVisible(false);
        return;
      }

      // Position above the selection
      const top = Math.max(10, rect.top - 46 + window.scrollY);
      const left = Math.max(
        10,
        rect.left + rect.width / 2 - 140 + window.scrollX
      );

      setPosition({ top, left });
      setIsVisible(true);
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("blur", () => {
      setTimeout(() => {
        if (!document.activeElement?.closest("[data-bubble-menu]")) {
          setIsVisible(false);
        }
      }, 150);
    });

    return () => {
      editor.off("selectionUpdate", updateMenu);
    };
  }, [editor]);

  if (!editor || !isVisible) {
    return null;
  }

  const handleLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div
      data-bubble-menu
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50,
      }}
      className="flex items-center gap-0.5 rounded-lg border bg-popover/95 p-1 text-popover-foreground shadow-lg backdrop-blur-xs transition-opacity duration-150 animate-in fade-in-0 zoom-in-95"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`size-7 text-xs ${
          editor.isActive("bold") ? "bg-accent text-accent-foreground font-bold" : ""
        }`}
        title="Bold"
      >
        <IconBold className="size-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`size-7 text-xs ${
          editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Italic"
      >
        <IconItalic className="size-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`size-7 text-xs ${
          editor.isActive("underline") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Underline"
      >
        <IconUnderline className="size-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`size-7 text-xs ${
          editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Strikethrough"
      >
        <IconStrikethrough className="size-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`size-7 text-xs ${
          editor.isActive("code") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Code"
      >
        <IconCode className="size-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`size-7 text-xs ${
          editor.isActive("highlight") ? "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100" : ""
        }`}
        title="Highlight"
      >
        <IconHighlight className="size-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleLink}
        className={`size-7 text-xs ${
          editor.isActive("link") ? "bg-accent text-accent-foreground" : ""
        }`}
        title="Link"
      >
        <IconLink className="size-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`size-7 text-xs ${
          editor.isActive("heading", { level: 1 })
            ? "bg-accent text-accent-foreground font-bold"
            : ""
        }`}
        title="Heading 1"
      >
        <IconH1 className="size-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`size-7 text-xs ${
          editor.isActive("heading", { level: 2 })
            ? "bg-accent text-accent-foreground font-bold"
            : ""
        }`}
        title="Heading 2"
      >
        <IconH2 className="size-3.5" />
      </Button>
    </div>
  );
}

