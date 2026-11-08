"use client";

import * as React from "react";
import Link from "next/link";
import {
  Archive,
  Check,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Inbox,
  Link2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Published</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/60">
            <span className="size-1.5 rounded-full bg-muted-foreground/60" />
            <span>Draft</span>
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>Closed</span>
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted/40 text-muted-foreground border border-border/40">
            <Archive className="size-3" />
            <span>Archived</span>
          </span>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px] h-5 px-2">
            {status}
          </Badge>
        );
    }
  };

  const getVisibilityDisplay = () => {
    if (form.status === "draft") {
      return (
        <span className="text-xs text-muted-foreground/50 font-mono">
          —
        </span>
      );
    }

    if (form.visibility === "public") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-normal">
          <Globe className="size-3.5 text-muted-foreground shrink-0" />
          <span>Public</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-normal">
        <Link2 className="size-3.5 text-muted-foreground/70 shrink-0" />
        <span>Unlisted</span>
      </span>
    );
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

  const isPublished = form.status === "published";
  const isDraft = form.status === "draft";

  // ==========================================
  // Grid / Card View Mode
  // ==========================================
  if (viewMode === "grid") {
    return (
      <div className="panel-highlight group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 transition-all hover:border-foreground/20 hover:shadow-xs min-h-[220px]">
        <div>
          {/* Header row: Status + Visibility + Menu */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {getStatusBadge(form.status)}
              <div className="pl-1">
                {getVisibilityDisplay()}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground opacity-80 group-hover:opacity-100 cursor-pointer"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Form menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs p-1 shadow-md">
                <DropdownMenuItem asChild className="gap-2 cursor-pointer py-1.5">
                  <Link href={`/dashboard/forms/${form.id}`}>
                    <FileText className="size-3.5" />
                    <span>Open Editor</span>
                  </Link>
                </DropdownMenuItem>
                {!isDraft && (
                  <DropdownMenuItem
                    onClick={() => onViewSubmissions(form)}
                    className="gap-2 cursor-pointer py-1.5"
                  >
                    <Inbox className="size-3.5" />
                    <span>View Responses</span>
                  </DropdownMenuItem>
                )}
                {isPublished && form.shareId && (
                  <DropdownMenuItem
                    onClick={handleCopyLink}
                    className="gap-2 cursor-pointer py-1.5"
                  >
                    <Copy className="size-3.5" />
                    <span>Copy Share Link</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onEdit(form)}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  <Pencil className="size-3.5" />
                  <span>Form Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(form)}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer py-1.5"
                >
                  <Trash2 className="size-3.5" />
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
            <h3 className="font-semibold text-sm text-foreground group-hover/title:underline transition-all line-clamp-1">
              {form.title}
            </h3>
            {form.description ? (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {form.description}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground/50 font-mono">
                Updated {formattedDate}
              </p>
            )}
          </Link>

          {/* Share ID Pill or Preview Pill */}
          <div className="mt-3">
            {isPublished && form.shareId ? (
              <div className="flex items-center gap-1.5 w-full">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer max-w-[200px]"
                  title="Click to copy public share link"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-500 shrink-0" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3 opacity-60 shrink-0" />
                      <span className="truncate whitespace-nowrap">{form.shareId}</span>
                    </>
                  )}
                </button>
                <a
                  href={`/f/${form.shareId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-7 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
                  title="Open live form in new tab"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            ) : (
              <Link
                href={`/dashboard/forms/${form.id}/preview`}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-2.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                title="Preview form before publishing"
              >
                <Eye className="size-3.5 opacity-60" />
                <span>Preview</span>
              </Link>
            )}
          </div>
        </div>

        {/* Footer Actions with Full-Width Separator */}
        <div className="mt-4 pt-3 -mx-4 sm:-mx-5 px-4 sm:px-5 border-t border-border/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-muted-foreground font-mono">
            {formattedDate}
          </span>

          <div className="flex items-center gap-2">
            {!isDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewSubmissions(form)}
                className="h-7.5 text-xs px-2.5 rounded-lg border-border/70 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
              >
                Responses
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-7.5 text-xs px-3 rounded-lg border-border/70 text-foreground hover:bg-muted cursor-pointer"
            >
              <Link href={`/dashboard/forms/${form.id}`}>Edit</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // List / Table View Mode (Matching 12-Col Grid)
  // ==========================================
  return (
    <div className="group flex items-center justify-between gap-4 p-3.5 sm:px-6 hover:bg-muted/20 transition-colors min-h-[68px]">
      {/* 12-Column Desktop Grid Layout */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
        {/* Col 1-5: Form Name & Description (Left-aligned) */}
        <div className="min-w-0 flex items-center gap-3 lg:col-span-5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-muted-foreground group-hover:text-foreground group-hover:border-foreground/20 transition-colors">
            <FileText className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/forms/${form.id}`}
              className="font-medium text-xs sm:text-sm text-foreground hover:underline transition-all truncate block"
            >
              {form.title}
            </Link>
            {form.description ? (
              <div className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">
                {form.description}
              </div>
            ) : (
              <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                Updated {formattedDate}
              </div>
            )}
          </div>
        </div>

        {/* Col 6-7: Status (Left-aligned) */}
        <div className="hidden lg:flex items-center lg:col-span-2">
          {getStatusBadge(form.status)}
        </div>

        {/* Col 8-9: Visibility (Left-aligned) */}
        <div className="hidden lg:flex items-center lg:col-span-2">
          {getVisibilityDisplay()}
        </div>

        {/* Col 10-11: Share Link / Preview (No Wrapping!) */}
        <div className="hidden lg:flex items-center lg:col-span-2 min-w-0">
          {isPublished && form.shareId ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3 text-emerald-500 shrink-0" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 opacity-60 shrink-0" />
                          <span className="truncate">{form.shareId}</span>
                        </>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-mono">
                    /f/{form.shareId} (Click to copy)
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <a
                href={`/f/${form.shareId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-7 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
                title="Open live form in new tab"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          ) : (
            <Link
              href={`/dashboard/forms/${form.id}/preview`}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-2.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
            >
              <Eye className="size-3.5 opacity-60" />
              <span>Preview</span>
            </Link>
          )}
        </div>
      </div>

      {/* Col 12: Actions (Right-aligned, Quieter Secondary Buttons) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!isDraft && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewSubmissions(form)}
            className="hidden sm:inline-flex h-7.5 text-xs px-2.5 rounded-lg border-border/70 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
          >
            Responses
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-7.5 text-xs px-3 rounded-lg border-border/70 text-foreground hover:bg-muted cursor-pointer"
        >
          <Link href={`/dashboard/forms/${form.id}`}>Edit</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <MoreVertical className="size-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs p-1 shadow-md">
            <DropdownMenuItem asChild className="gap-2 cursor-pointer py-1.5">
              <Link href={`/dashboard/forms/${form.id}`}>
                <FileText className="size-3.5" />
                <span>Open Editor</span>
              </Link>
            </DropdownMenuItem>
            {!isDraft && (
              <DropdownMenuItem
                onClick={() => onViewSubmissions(form)}
                className="gap-2 cursor-pointer py-1.5"
              >
                <Inbox className="size-3.5" />
                <span>View Responses</span>
              </DropdownMenuItem>
            )}
            {isPublished && form.shareId && (
              <DropdownMenuItem
                onClick={handleCopyLink}
                className="gap-2 cursor-pointer py-1.5"
              >
                <Copy className="size-3.5" />
                <span>Copy Share Link</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onEdit(form)}
              className="gap-2 cursor-pointer py-1.5"
            >
              <Pencil className="size-3.5" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(form)}
              className="gap-2 text-destructive focus:text-destructive cursor-pointer py-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>Delete Form</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
