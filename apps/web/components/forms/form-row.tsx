"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconFileText,
  IconGlobe,
  IconInbox,
  IconLock,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type FormItem } from "~/hooks/api/form";

interface FormRowProps {
  form: FormItem;
  viewMode: "list" | "grid";
  onEdit: (form: FormItem) => void;
  onDelete: (form: FormItem) => void;
  onViewSubmissions: (form: FormItem) => void;
}

export function FormRow({
  form,
  viewMode,
  onEdit,
  onDelete,
  onViewSubmissions,
}: FormRowProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/f/${form.shareId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const getStatusBadge = (status: FormItem["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge
            variant="default"
            className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/15 gap-1.5 font-medium text-[11px] h-5 px-2"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="secondary"
            className="text-[11px] h-5 px-2 font-medium text-muted-foreground bg-muted/60"
          >
            Draft
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="outline"
            className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-[11px] h-5 px-2 font-medium"
          >
            Closed
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="text-muted-foreground text-[11px] h-5 px-2 font-medium">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-[11px] h-5 px-2">{status}</Badge>;
    }
  };

  const formattedDate = React.useMemo(() => {
    if (!form.updatedAt) return "—";
    const date = new Date(form.updatedAt);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [form.updatedAt]);

  // ==========================================
  // Grid / Card View Mode
  // ==========================================
  if (viewMode === "grid") {
    return (
      <div className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 sm:p-5 transition-all hover:border-border hover:shadow-xs hover:bg-card/90">
        <div>
          {/* Header row: Status + Options */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {getStatusBadge(form.status)}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {form.visibility === "public" ? (
                  <span className="inline-flex items-center gap-1 text-muted-foreground" title="Public Form">
                    <IconGlobe className="size-3 text-muted-foreground" />
                    <span>Public</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground" title="Unlisted Form">
                    <IconLock className="size-3 text-muted-foreground" />
                    <span>Unlisted</span>
                  </span>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground opacity-80 group-hover:opacity-100"
                >
                  <IconDotsVertical className="size-4" />
                  <span className="sr-only">Form menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs p-1">
                <DropdownMenuItem asChild className="gap-2 cursor-pointer py-1.5">
                  <Link href={`/dashboard/forms/${form.id}`}>
                    <IconFileText className="size-3.5" />
                    <span>Open Editor</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onViewSubmissions(form)}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  <IconInbox className="size-3.5" />
                  <span>View Responses</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCopyLink}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  <IconCopy className="size-3.5" />
                  <span>Copy Public Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(form)}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  <IconEdit className="size-3.5" />
                  <span>Form Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(form)}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer py-1.5"
                >
                  <IconTrash className="size-3.5" />
                  <span>Delete Form</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Form Title & Description */}
          <Link
            href={`/dashboard/forms/${form.id}`}
            className="block group/title focus-visible:outline-none"
          >
            <h3 className="font-semibold text-sm text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
              {form.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
              {form.description || "No description provided"}
            </p>
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-muted-foreground/80 font-mono">
            {formattedDate}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSubmissions(form)}
              className="h-7 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground font-medium"
            >
              Responses
            </Button>
            <Button
              size="sm"
              asChild
              className="h-7 text-xs px-2.5 rounded-lg shadow-2xs"
            >
              <Link href={`/dashboard/forms/${form.id}`}>Edit</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // List / Table View Mode (Editorial Row)
  // ==========================================
  return (
    <div className="group flex items-center justify-between gap-4 p-3.5 sm:px-4 rounded-xl border border-border/50 bg-card hover:bg-muted/20 hover:border-border transition-all">
      {/* Title & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground group-hover:text-foreground transition-colors">
          <IconFileText className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/forms/${form.id}`}
              className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate"
            >
              {form.title}
            </Link>
            {getStatusBadge(form.status)}
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
            {form.description ? (
              <span className="truncate max-w-xs">{form.description}</span>
            ) : (
              <span className="italic text-muted-foreground/60">No description</span>
            )}
            <span>·</span>
            <span>Updated {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Visibility & Link (Desktop / Wide screens) */}
      <div className="hidden xl:flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-20">
          {form.visibility === "public" ? (
            <>
              <IconGlobe className="size-3.5 text-muted-foreground" />
              <span>Public</span>
            </>
          ) : (
            <>
              <IconLock className="size-3.5 text-muted-foreground" />
              <span>Unlisted</span>
            </>
          )}
        </div>

        {form.shareId && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/60 bg-muted/20 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Click to copy public link"
            >
              {copied ? (
                <>
                  <IconCheck className="size-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-sans">Copied!</span>
                </>
              ) : (
                <>
                  <IconCopy className="size-3" />
                  <span>{form.shareId}</span>
                </>
              )}
            </button>
            <a
              href={`/f/${form.shareId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open public form in new tab"
            >
              <IconExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewSubmissions(form)}
          className="hidden lg:inline-flex h-7.5 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground font-medium"
        >
          Responses
        </Button>

        <Button
          size="sm"
          asChild
          className="h-7.5 text-xs px-3 rounded-lg shadow-2xs"
        >
          <Link href={`/dashboard/forms/${form.id}`}>Edit</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs p-1">
            <DropdownMenuItem asChild className="gap-2 cursor-pointer py-1.5">
              <Link href={`/dashboard/forms/${form.id}`}>
                <IconFileText className="size-3.5" />
                <span>Open Editor</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onViewSubmissions(form)}
              className="gap-2 cursor-pointer py-1.5"
            >
              <IconInbox className="size-3.5" />
              <span>View Responses</span>
            </DropdownMenuItem>
            {form.shareId && (
              <DropdownMenuItem
                onClick={handleCopyLink}
                className="gap-2 cursor-pointer py-1.5"
              >
                <IconCopy className="size-3.5" />
                <span>Copy Public Link</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onEdit(form)}
              className="gap-2 cursor-pointer py-1.5"
            >
              <IconEdit className="size-3.5" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(form)}
              className="gap-2 text-destructive focus:text-destructive cursor-pointer py-1.5"
            >
              <IconTrash className="size-3.5" />
              <span>Delete Form</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
