"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconLoader,
  IconPlus,
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
  formId?: string;
  title: string;
  shareId?: string | null;
  status?: string;
  saveStatus: SaveStatus;
  lastSavedAt?: Date | null;
  onInsertField: (field: {
    type: string;
    label: string;
    placeholder?: string;
    config?: Record<string, unknown>;
  }) => void;
}

export function EditorHeader({
  title,
  shareId,
  status = "draft",
  saveStatus,
  onInsertField,
}: EditorHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    if (!shareId) return;
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/f/${shareId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const menuItems = getSlashMenuItems(onInsertField);
  const formFieldItems = menuItems.filter((i) => i.category === "form");

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
            <IconLoader className="size-3.5 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <span className="size-2 rounded-full bg-destructive" />
            <span>Save failed</span>
          </div>
        );
      case "unsaved":
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <span className="size-2 rounded-full bg-amber-500" />
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
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
          title="Back to dashboard"
        >
          <IconArrowLeft className="size-4" />
          <span className="hidden sm:inline">Forms</span>
        </Link>

        <span className="text-muted-foreground/40 text-sm hidden sm:inline">/</span>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-semibold text-sm truncate max-w-[200px] md:max-w-md">
            {title || "Untitled Form"}
          </h1>
          <Badge
            variant="outline"
            className="text-[10px] capitalize px-1.5 py-0 h-4 hidden md:inline-flex"
          >
            {status}
          </Badge>
        </div>

        <div className="ml-2 pl-3 border-l border-border/60 hidden md:block">
          {renderSaveStatus()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="md:hidden mr-1">{renderSaveStatus()}</div>

        {/* Quick Add Field Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
              <IconPlus className="size-3.5" />
              <span>Add Field</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
            <DropdownMenuLabel className="text-xs">
              Choose Question Type
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

        {/* Share Link Button */}
        {shareId && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Copy share link"
          >
            {copied ? (
              <>
                <IconCheck className="size-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <IconCopy className="size-3.5" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
