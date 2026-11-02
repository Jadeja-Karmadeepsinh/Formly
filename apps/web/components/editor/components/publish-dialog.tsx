"use client";

import * as React from "react";
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconEye,
  IconLoader,
  IconSparkles,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { usePublishForm, useUnpublishForm } from "~/hooks/api/form";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  shareId: string;
  title: string;
  fieldCount: number;
  isDirty: boolean;
  status: string;
  onSaveDraft: () => Promise<boolean>;
  onPublishedChange?: (newStatus: "published" | "draft") => void;
}

export function PublishDialog({
  open,
  onOpenChange,
  formId,
  shareId,
  title,
  fieldCount,
  isDirty,
  status,
  onSaveDraft,
  onPublishedChange,
}: PublishDialogProps) {
  const { publishFormAsync, isPending: isPublishing } = usePublishForm();
  const { unpublishFormAsync, isPending: isUnpublishing } = useUnpublishForm();

  const [copied, setCopied] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/f/${shareId}`;

  const isAlreadyPublished = status === "published";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handlePublish = async () => {
    // 1. Validation
    if (!title.trim()) {
      toast.error("Please give your form a title before publishing");
      return;
    }

    if (fieldCount === 0) {
      toast.error("Add at least one question to your form before publishing");
      return;
    }

    setIsProcessing(true);
    try {
      // 2. Save any draft changes first
      if (isDirty) {
        const saved = await onSaveDraft();
        if (!saved) {
          setIsProcessing(false);
          return;
        }
      }

      // 3. Mark form as published
      await publishFormAsync({ id: formId });
      onPublishedChange?.("published");
      toast.success("Form is now published and live!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish form";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsProcessing(true);
    try {
      await unpublishFormAsync({ id: formId });
      onPublishedChange?.("draft");
      toast.info("Form unpublished. It is now back in draft mode.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to unpublish form";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const loading = isPublishing || isUnpublishing || isProcessing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {isAlreadyPublished ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                Live & Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Draft
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg font-semibold">
            {isAlreadyPublished ? "Form is Published" : "Publish your Form"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isAlreadyPublished
              ? "Your form is currently accepting responses via the link below."
              : "Make your form live and start collecting responses from anyone with the link."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* Share Link Row */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={publicUrl}
                className="text-xs font-mono bg-muted/40 select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 gap-1.5 text-xs h-9 px-3"
              >
                {copied ? (
                  <>
                    <IconCheck className="size-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="size-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Validation Checklist / Summary */}
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Questions count</span>
              <span className="font-semibold text-foreground">{fieldCount}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Unsaved changes</span>
              <span className={isDirty ? "font-semibold text-amber-500" : "text-emerald-500"}>
                {isDirty ? "Pending save" : "Up to date"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
          <div>
            {isAlreadyPublished && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={handleUnpublish}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8 px-2.5"
              >
                {loading ? "Updating..." : "Unpublish Form"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="text-xs h-9 gap-1.5"
            >
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <IconExternalLink className="size-3.5" />
                <span>Open Form</span>
              </a>
            </Button>

            {!isAlreadyPublished && (
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={handlePublish}
                className="text-xs h-9 gap-1.5"
              >
                {loading && <IconLoader className="size-3.5 animate-spin" />}
                <IconWorld className="size-3.5" />
                <span>Publish Now</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

