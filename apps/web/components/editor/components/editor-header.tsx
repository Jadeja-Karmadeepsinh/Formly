"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconEye,
  IconHelp,
  IconHistory,
  IconLoader,
  IconShare,
  IconWorld,
} from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface EditorHeaderProps {
  formId: string;
  title: string;
  shareId?: string | null;
  status?: string;
  saveStatus: SaveStatus;
  isDirty: boolean;
  currentVersionNumber?: number;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave: () => void;
  onOpenHistory?: () => void;
  onOpenPreview: () => void;
  onOpenPublish: () => void;
  onOpenShortcuts: () => void;
}

export function EditorHeader({
  title,
  status = "draft",
  saveStatus,
  isDirty,
  currentVersionNumber,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onSave,
  onOpenHistory,
  onOpenPreview,
  onOpenPublish,
  onOpenShortcuts,
}: EditorHeaderProps) {
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
            <span>Unsaved</span>
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
    <header className="sticky top-0 z-30 flex h-13 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md">
      {/* Left: Back Link, Title Breadcrumb, Status & Version Badges */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
          title="Back to forms dashboard"
        >
          <IconArrowLeft className="size-4" />
          <span className="hidden sm:inline">Forms</span>
        </Link>

        <span className="text-muted-foreground/30 text-xs hidden sm:inline">/</span>

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-xs text-foreground">
            {title || "Untitled Form"}
          </span>

          <Badge
            variant={status === "published" ? "default" : "outline"}
            className={`text-[10px] capitalize px-1.5 py-0 h-4 ${
              status === "published"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium"
                : "text-muted-foreground"
            }`}
          >
            {status}
          </Badge>

          {currentVersionNumber !== undefined && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Click to view version history"
            >
              v{currentVersionNumber}
            </button>
          )}
        </div>

        <div className="ml-2 pl-3 border-l border-border/60 hidden md:block">
          {renderSaveStatusText()}
        </div>
      </div>

      {/* Right: Undo, Redo, Version History, Preview, Save Changes, Publish */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center border rounded-lg p-0.5 bg-background hidden sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!canUndo}
            onClick={onUndo}
            className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30 active:scale-95 transition-all"
            title={`Undo (${modKey}+Z)`}
          >
            <IconArrowBackUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!canRedo}
            onClick={onRedo}
            className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30 active:scale-95 transition-all"
            title={`Redo (${modKey}+Shift+Z)`}
          >
            <IconArrowForwardUp className="size-3.5" />
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
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

        {/* Version History Button */}
        {onOpenHistory && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onOpenHistory}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all"
            title="Version History"
          >
            <IconHistory className="size-3.5" />
            <span className="hidden sm:inline">History</span>
          </Button>
        )}

        {/* Preview Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onOpenPreview}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all"
          title={`Preview Form (${modKey}+P)`}
        >
          <IconEye className="size-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        {/* Save Changes Button */}
        <Button
          type="button"
          size="sm"
          variant={isDirty ? "default" : "outline"}
          disabled={saveStatus === "saving" || !isDirty}
          onClick={onSave}
          className={`h-8 gap-1.5 text-xs transition-all active:scale-[0.98] ${
            isDirty
              ? "bg-primary text-primary-foreground shadow-xs font-medium cursor-pointer"
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
          className={`h-8 gap-1.5 text-xs font-medium active:scale-[0.98] transition-all ${
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
