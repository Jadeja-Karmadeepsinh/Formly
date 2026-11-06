"use client";

import * as React from "react";
import Link from "next/link";
import {
  Archive,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FilePenLine,
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
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 gap-1.5 font-medium text-[11px] h-5.5 px-2 hover:bg-emerald-500/15"
          >
            <CheckCircle2 className="size-3 text-emerald-500" />
            <span>Published</span>
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="secondary"
            className="text-[11px] h-5.5 px-2 font-medium text-muted-foreground bg-muted/60 border border-border/40 gap-1.5"
          >
            <FilePenLine className="size-3 text-muted-foreground/80" />
            <span>Draft</span>
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="outline"
            className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 text-[11px] h-5.5 px-2 font-medium gap-1.5"
          >
            <Clock className="size-3" />
            <span>Closed</span>
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground border-border/60 bg-muted/20 text-[11px] h-5.5 px-2 font-medium gap-1.5"
          >
            <Archive className="size-3" />
            <span>Archived</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px] h-5.5 px-2">
            {status}
          </Badge>
        );
    }
  };

  const getVisibilityBadge = (visibility: FormItem["visibility"]) => {
    switch (visibility) {
      case "public":
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-normal"
            title="Public form — Accessible to anyone"
          >
            <Globe className="size-3.5 text-muted-foreground/70 shrink-0" />
            <span>Public</span>
          </span>
        );
      case "unlisted":
      default:
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-normal"
            title="Unlisted form — Anyone with the link can access"
          >
            <Link2 className="size-3.5 text-muted-foreground/70 shrink-0" />
            <span>Unlisted</span>
          </span>
        );
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

  const isPublished = form.status === "published";

  // ==========================================
  // Grid / Card View Mode
  // ==========================================
  if (viewMode === "grid") {
    return (
      <div className="panel-highlight group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 transition-all hover:border-foreground/20 hover:shadow-sm">
        <div>
          {/* Header row: Status + Visibility + Menu */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {getStatusBadge(form.status)}
              <div className="pl-1">
                {getVisibilityBadge(form.visibility)}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground opacity-80 group-hover:opacity-100"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Form menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs p-1">
                <DropdownMenuItem asChild className="gap-2 cursor-pointer py-1.5">
                  <Link href={`/dashboard/forms/${form.id}`}>
                    <FileText className="size-3.5" />
                    <span>Open Editor</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onViewSubmissions(form)}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  <Inbox className="size-3.5" />
                  <span>View Responses</span>
                </DropdownMenuItem>
                {form.shareId && (
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
            <h3 className="font-semibold text-sm text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
              {form.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
              {form.description || "No description provided"}
            </p>
          </Link>

          {/* Share ID Pill or Preview Pill */}
          <div className="mt-3">
            {isPublished && form.shareId ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex h-6.5 items-center gap-1.5 rounded-md border border-border/60 bg-muted/20 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                  title="Click to copy public link"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3 opacity-60" />
                      <span>{form.shareId}</span>
                    </>
                  )}
                </button>
                <a
                  href={`/f/${form.shareId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-6.5 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  title="Open live form in new tab"
                >
                  <ExternalLink className="size-3" />
                </a>
              </div>
            ) : (
              <Link
                href={`/dashboard/forms/${form.id}/preview`}
                className="inline-flex h-6.5 items-center gap-1.5 rounded-md border border-border/40 bg-muted/20 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                title="Preview form before publishing"
              >
                <Eye className="size-3 opacity-60" />
                <span>Preview Draft</span>
              </Link>
            )}
          </div>
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
              className="h-7 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground font-medium active:scale-[0.98] transition-all"
            >
              Responses
            </Button>
            <Button
              size="sm"
              asChild
              className="h-7 text-xs px-2.5 rounded-lg shadow-2xs active:scale-[0.98] transition-all"
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
    <div className="panel-highlight group flex items-center justify-between gap-4 p-3.5 sm:px-4 rounded-xl border border-border/70 bg-card hover:bg-muted/25 hover:border-foreground/20 transition-all shadow-2xs">
      {/* Title & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground group-hover:text-foreground group-hover:border-border transition-colors">
          <FileText className="size-4" />
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
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
      <div className="hidden xl:flex items-center gap-4 shrink-0">
        <div className="w-20">
          {getVisibilityBadge(form.visibility)}
        </div>

        {/* Share Link for Published or Preview Link for Draft */}
        <div className="w-44 flex items-center justify-start">
          {isPublished && form.shareId ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/60 bg-muted/20 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                title="Click to copy public link"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-sans">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3 opacity-60" />
                    <span>{form.shareId}</span>
                  </>
                )}
              </button>
              <a
                href={`/f/${form.shareId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Open live form in new tab"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          ) : (
            <Link
              href={`/dashboard/forms/${form.id}/preview`}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/40 bg-muted/20 px-2.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              title="Preview form before publishing"
            >
              <Eye className="size-3 opacity-60" />
              <span>Preview Draft</span>
            </Link>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewSubmissions(form)}
          className="hidden lg:inline-flex h-7.5 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground font-medium active:scale-[0.98] transition-all"
        >
          Responses
        </Button>

        <Button
          size="sm"
          asChild
          className="h-7.5 text-xs px-3 rounded-lg shadow-2xs active:scale-[0.98] transition-all"
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
              <MoreVertical className="size-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs p-1">
            <DropdownMenuItem asChild className="gap-2 cursor-pointer py-1.5">
              <Link href={`/dashboard/forms/${form.id}`}>
                <FileText className="size-3.5" />
                <span>Open Editor</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onViewSubmissions(form)}
              className="gap-2 cursor-pointer py-1.5"
            >
              <Inbox className="size-3.5" />
              <span>View Responses</span>
            </DropdownMenuItem>
            {form.shareId && (
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
