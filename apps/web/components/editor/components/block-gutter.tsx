"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconArrowDown,
  IconArrowUp,
  IconCopy,
  IconGripVertical,
  IconPlus,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "~/components/ui/dropdown-menu";
import {
  getSlashMenuItems,
  type InsertFormFieldCallback,
} from "./slash-command-menu";

interface BlockGutterProps {
  editor: Editor | null;
  onOpenProperties?: () => void;
  onInsertField: InsertFormFieldCallback;
}

export function BlockGutter({
  editor,
  onOpenProperties,
  onInsertField,
}: BlockGutterProps) {
  const [activeTop, setActiveTop] = React.useState<number | null>(null);
  const [targetDomNode, setTargetDomNode] = React.useState<HTMLElement | null>(null);
  const [isQuestionBlock, setIsQuestionBlock] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Track mouse movement over the editor to place gutter beside the active block
  React.useEffect(() => {
    if (!editor) return;

    const editorEl = editor.view.dom;

    const handleMouseMove = (e: MouseEvent) => {
      if (isMenuOpen || isPlusMenuOpen) return;

      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!target || !editorEl.contains(target)) {
        return;
      }

      // Find top-level block inside .ProseMirror
      let blockEl: HTMLElement | null = target;
      while (blockEl && blockEl.parentElement && blockEl.parentElement !== editorEl) {
        blockEl = blockEl.parentElement;
      }

      if (!blockEl || blockEl === editorEl) {
        return;
      }

      const blockRect = blockEl.getBoundingClientRect();
      const editorRect = editorEl.getBoundingClientRect();

      const topOffset = blockRect.top - editorRect.top;
      setActiveTop(topOffset + 4);
      setTargetDomNode(blockEl);
      setIsQuestionBlock(
        blockEl.getAttribute("data-type") === "form-field" ||
        blockEl.querySelector('[data-type="form-field"]') !== null
      );
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Hide gutter when cursor exits far to the left or right, unless menu is open
      if (!isMenuOpen && !isPlusMenuOpen) {
        const related = e.relatedTarget as HTMLElement | null;
        if (!related || (!editorEl.contains(related) && !containerRef.current?.contains(related))) {
          // Keep active top subtle or let it persist
        }
      }
    };

    editorEl.addEventListener("mousemove", handleMouseMove);
    editorEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      editorEl.removeEventListener("mousemove", handleMouseMove);
      editorEl.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [editor, isMenuOpen, isPlusMenuOpen]);

  if (!editor || activeTop === null) {
    return null;
  }

  // Get ProseMirror position of current target block
  const getTargetPos = () => {
    if (!editor || !targetDomNode) return null;
    try {
      const pos = editor.view.posAtDOM(targetDomNode, 0);
      return pos;
    } catch {
      return null;
    }
  };

  // Actions
  const handleDuplicate = () => {
    if (!editor || !targetDomNode) return;
    const pos = getTargetPos();
    if (pos === null) return;

    const resolved = editor.state.doc.resolve(pos);
    const node = resolved.nodeAfter || resolved.parent;
    if (!node) return;

    const endPos = pos + node.nodeSize;
    editor
      .chain()
      .focus()
      .insertContentAt(endPos, node.toJSON())
      .run();
  };

  const handleDelete = () => {
    if (!editor || !targetDomNode) return;
    const pos = getTargetPos();
    if (pos === null) return;

    const resolved = editor.state.doc.resolve(pos);
    const node = resolved.nodeAfter;
    if (node) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run();
    }
  };

  const handleMoveUp = () => {
    if (!editor || !targetDomNode) return;
    const pos = getTargetPos();
    if (pos === null || pos <= 0) return;

    const resolved = editor.state.doc.resolve(pos);
    const node = resolved.nodeAfter;
    if (!node) return;

    const beforePos = resolved.before();
    const prevNode = resolved.doc.resolve(beforePos).nodeBefore;
    if (!prevNode) return;

    const prevSize = prevNode.nodeSize;
    const currentSize = node.nodeSize;

    const tr = editor.state.tr;
    const nodeSlice = tr.doc.slice(pos, pos + currentSize);
    tr.delete(pos, pos + currentSize);
    tr.insert(pos - prevSize, nodeSlice.content);
    editor.view.dispatch(tr);
  };

  const handleMoveDown = () => {
    if (!editor || !targetDomNode) return;
    const pos = getTargetPos();
    if (pos === null) return;

    const resolved = editor.state.doc.resolve(pos);
    const node = resolved.nodeAfter;
    if (!node) return;

    const afterPos = pos + node.nodeSize;
    if (afterPos >= editor.state.doc.content.size) return;

    const nextNode = editor.state.doc.resolve(afterPos).nodeAfter;
    if (!nextNode) return;

    const nextSize = nextNode.nodeSize;
    const currentSize = node.nodeSize;

    const tr = editor.state.tr;
    const nodeSlice = tr.doc.slice(pos, pos + currentSize);
    tr.delete(pos, pos + currentSize);
    tr.insert(pos + nextSize, nodeSlice.content);
    editor.view.dispatch(tr);
  };

  const handleInsertBelow = () => {
    if (!editor || !targetDomNode) return;
    const pos = getTargetPos();
    if (pos === null) return;

    const resolved = editor.state.doc.resolve(pos);
    const node = resolved.nodeAfter;
    const insertPos = node ? pos + node.nodeSize : pos;

    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, {
        type: "paragraph",
        content: [{ type: "text", text: "/" }],
      })
      .run();
  };

  const menuItems = getSlashMenuItems(onInsertField);
  const formItems = menuItems.filter((i) => i.category === "form");
  const basicItems = menuItems.filter((i) => i.category === "basic");

  return (
    <div
      ref={containerRef}
      style={{
        transform: `translateY(${activeTop}px)`,
      }}
      className="absolute -left-12 sm:-left-14 flex items-center gap-0.5 transition-transform duration-75 ease-out select-none z-20"
    >
      {/* Plus Button to insert at current block */}
      <DropdownMenu open={isPlusMenuOpen} onOpenChange={setIsPlusMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            title="Click to insert block below"
          >
            <IconPlus className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
          <div className="px-2 py-1 text-[10px] font-semibold text-primary uppercase tracking-wider">
            Add Question
          </div>
          {formItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.title}
                onSelect={() => {
                  if (!editor || !targetDomNode) return;
                  const pos = getTargetPos();
                  const resolved = pos !== null ? editor.state.doc.resolve(pos) : null;
                  const node = resolved?.nodeAfter;
                  const insertPos = node && pos !== null ? pos + node.nodeSize : editor.state.doc.content.size;

                  editor.chain().focus().setTextSelection(insertPos).run();
                  item.command(editor, { from: insertPos, to: insertPos });
                }}
                className="gap-2 cursor-pointer text-xs"
              >
                <Icon className="size-3.5 text-muted-foreground" />
                <span>{item.title}</span>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />

          <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Content Blocks
          </div>
          {basicItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.title}
                onSelect={() => {
                  if (!editor || !targetDomNode) return;
                  const pos = getTargetPos();
                  const resolved = pos !== null ? editor.state.doc.resolve(pos) : null;
                  const node = resolved?.nodeAfter;
                  const insertPos = node && pos !== null ? pos + node.nodeSize : editor.state.doc.content.size;

                  editor.chain().focus().setTextSelection(insertPos).run();
                  item.command(editor, { from: insertPos, to: insertPos });
                }}
                className="gap-2 cursor-pointer text-xs"
              >
                <Icon className="size-3.5 text-muted-foreground" />
                <span>{item.title}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Drag Handle / Block Actions Trigger */}
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors cursor-grab active:cursor-grabbing"
            title="Click for block menu or drag to reorder"
          >
            <IconGripVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {isQuestionBlock && onOpenProperties && (
            <>
              <DropdownMenuItem
                onSelect={onOpenProperties}
                className="gap-2 cursor-pointer text-xs"
              >
                <IconSettings className="size-3.5 text-muted-foreground" />
                <span>Question Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            onSelect={handleDuplicate}
            className="gap-2 cursor-pointer text-xs"
          >
            <IconCopy className="size-3.5 text-muted-foreground" />
            <span>Duplicate</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleMoveUp}
            className="gap-2 cursor-pointer text-xs"
          >
            <IconArrowUp className="size-3.5 text-muted-foreground" />
            <span>Move Up</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleMoveDown}
            className="gap-2 cursor-pointer text-xs"
          >
            <IconArrowDown className="size-3.5 text-muted-foreground" />
            <span>Move Down</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={handleDelete}
            className="gap-2 cursor-pointer text-xs text-destructive hover:text-destructive focus:text-destructive"
          >
            <IconTrash className="size-3.5" />
            <span>Delete Block</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

