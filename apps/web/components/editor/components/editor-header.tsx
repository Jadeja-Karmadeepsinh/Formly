"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconDeviceFloppy,
  IconEye,
  IconHelp,
  IconLoader,
  IconPlus,
  IconShare,
  IconWorld,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getSlashMenuItems } from "./slash-command-menu";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface EditorHeaderProps {
  formId: string;
  title: string;
  shareId?: string | null;
  status?: string;
  saveStatus: SaveStatus;
  isDirty: boolean;
  onSave: () => void;
  onOpenPreview: () => void;
  onOpenPublish: () => void;
  onOpenShortcuts: () => void;
  onInsertField: (field: {
    type: string;
    label: string;
    placeholder?: string;
    config?: Record<string, unknown>;
  }) => void;
}

export function EditorHeader({
  formId,
  title,
  shareId,
  status = "draft",
  saveStatus,
  isDirty,
  onSave,
  onOpenPreview,
  onOpenPublish,
  onOpenShortcuts,
  onInsertField,
}: EditorHeaderProps) {
  const menuItems = getSlashMenuItems(onInsertField);
  const formFieldItems = menuItems.filter((i) => i.category === "form");

  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const renderSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconLoader className="size-3.5 animate-spin text-primary" />
            <span>Saving...</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <span className="size-2 rounded-full bg-destructive" />
            <span>Save error</span>
          </div>
        );
      case "unsaved":
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Unsaved changes</span>
          </div>
        );
      case "saved":
      default:
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconCheck className="size-3.5 text-emerald-500" />
            <span>Saved</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-xs">
      {/* Left: Breadcrumbs, Title, Status */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
          title="Back to dashboard"
        >
          <IconArrowLeft className="size-4" />
          <span className="hidden sm:inline">Forms</span>
        </Link>

        <span className="text-muted-foreground/30 text-sm hidden sm:inline">/</span>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-semibold text-sm truncate max-w-[140px] sm:max-w-xs md:max-w-md text-foreground">
            {title || "Untitled Form"}
          </h1>

          <Badge
            variant={status === "published" ? "default" : "outline"}
            className={`text-[10px] capitalize px-1.5 py-0 h-4 hidden md:inline-flex ${
              status === "published"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "text-muted-foreground"
            }`}
          >
            {status}
          </Badge>
        </div>

        <div className="ml-2 pl-3 border-l border-border/60 hidden md:block">
          {renderSaveStatusText()}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Help / Shortcuts Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenShortcuts}
          className="size-8 text-muted-foreground hover:text-foreground hidden sm:inline-flex"
          title="Keyboard shortcuts"
        >
          <IconHelp className="size-4" />
        </Button>

        {/* Quick Add Question Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
              <IconPlus className="size-3.5" />
              <span className="hidden sm:inline">Add Question</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
            <DropdownMenuLabel className="text-xs">
              Form Question Types
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {formFieldItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.title}
                  onSelect={() => {
                    const dummyEditor = {
                      chain: () => ({
                        focus: () => ({
                          deleteRange: () => ({
                            run: () => {},
                          }),
                        }),
                      }),
                    };
                    item.command(dummyEditor, { from: 0, to: 0 });
                  }}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{item.title}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Preview Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onOpenPreview}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          title={`Preview Form (${modKey}+P)`}
        >
          <IconEye className="size-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        {/* Explicit Save Changes Button */}
        <Button
          type="button"
          size="sm"
          variant={isDirty ? "default" : "outline"}
          disabled={saveStatus === "saving" || !isDirty}
          onClick={onSave}
          className={`h-8 gap-1.5 text-xs transition-all ${
            isDirty
              ? "bg-primary text-primary-foreground shadow-xs font-medium"
              : "text-muted-foreground border-border/60"
          }`}
          title={`Save Changes (${modKey}+S)`}
        >
          {saveStatus === "saving" ? (
            <IconLoader className="size-3.5 animate-spin" />
          ) : (
            <IconDeviceFloppy className="size-3.5" />
          )}
          <span>{isDirty ? "Save Changes" : "Saved"}</span>
          <span className="text-[10px] opacity-60 hidden md:inline">
            ({modKey}S)
          </span>
        </Button>

        {/* Publish / Share Button */}
        <Button
          type="button"
          size="sm"
          onClick={onOpenPublish}
          className={`h-8 gap-1.5 text-xs font-medium ${
            status === "published"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
          title={status === "published" ? "Manage Publication" : "Publish Form"}
        >
          {status === "published" ? (
            <>
              <IconShare className="size-3.5" />
              <span>Share</span>
            </>
          ) : (
            <>
              <IconWorld className="size-3.5" />
              <span>Publish</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
