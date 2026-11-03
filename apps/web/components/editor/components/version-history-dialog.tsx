"use client";

import * as React from "react";
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconHistory,
  IconLoader,
  IconRotateClockwise2,
  IconWorld,
  IconFileText,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  useFormVersions,
  useFormVersion,
  useRestoreFormVersion,
  type FormVersionItem,
} from "~/hooks/api/form";

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formStatus?: string;
  publishedVersionId?: string | null;
  currentVersionNumber?: number;
  onRestored?: (restoredForm: any, restoredFields: any[], newVersionNumber: number) => void;
}

function formatRelativeTimestamp(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Unknown date";
  const date = new Date(dateInput);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  }
  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} at ${timeStr}`;
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  formId,
  formStatus = "draft",
  publishedVersionId,
  currentVersionNumber,
  onRestored,
}: VersionHistoryDialogProps) {
  const { versions, isLoading: isVersionsLoading } = useFormVersions(formId, {
    enabled: open,
  });

  const [selectedVersionId, setSelectedVersionId] = React.useState<string | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  // Default to selecting the first version (latest) when versions load
  React.useEffect(() => {
    if (versions.length > 0 && !selectedVersionId) {
      setSelectedVersionId(versions[0]?.id || null);
    }
  }, [versions, selectedVersionId]);

  // Load details of the selected version snapshot
  const {
    version: selectedVersion,
    elements: selectedElements,
    isLoading: isDetailLoading,
  } = useFormVersion(
    { formId, versionId: selectedVersionId || undefined },
    { enabled: open && Boolean(selectedVersionId) }
  );

  const { restoreFormVersionAsync, isPending: isRestoring } =
    useRestoreFormVersion();

  const handleSelectVersion = (version: FormVersionItem) => {
    setSelectedVersionId(version.id);
  };

  const handleConfirmRestore = async () => {
    if (!selectedVersion) return;

    try {
      const result = await restoreFormVersionAsync({
        formId,
        versionId: selectedVersion.id,
        expectedVersion: currentVersionNumber,
      });

      setIsConfirmOpen(false);
      onOpenChange(false);

      if (onRestored) {
        onRestored(result.form, result.fields, result.version.versionNumber);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to restore version";
      toast.error(msg);
    }
  };

  const latestVersionNumber = versions[0]?.versionNumber || 1;
  const isCurrentDraft =
    selectedVersion?.versionNumber === currentVersionNumber;
  const isSelectedPublished =
    selectedVersion?.id === publishedVersionId ||
    Boolean(selectedVersion?.publishedAt);
  const isFormCurrentlyPublished = formStatus === "published";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[85vh] max-h-[750px] p-0 flex flex-col gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-4 sm:p-6 border-b shrink-0 bg-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <IconHistory className="size-5 text-primary" />
                  Version History
                </DialogTitle>
                <DialogDescription>
                  Review immutable saved snapshots and restore past versions of your form.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Master-Detail Body */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left: Versions Timeline */}
            <div className="w-72 sm:w-80 border-r bg-muted/20 flex flex-col shrink-0">
              <div className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b bg-muted/30 flex items-center justify-between">
                <span>Snapshots</span>
                <span className="text-[11px] font-mono font-medium text-foreground">
                  {versions.length}
                </span>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1.5">
                  {isVersionsLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-2 text-muted-foreground">
                      <IconLoader className="size-5 animate-spin" />
                      <span className="text-xs">Loading versions...</span>
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No versions recorded yet. Save changes to create version snapshots.
                    </div>
                  ) : (
                    versions.map((ver) => {
                      const isSelected = ver.id === selectedVersionId;
                      const isLatest = ver.versionNumber === currentVersionNumber;
                      const isVerPublished =
                        ver.id === publishedVersionId || Boolean(ver.publishedAt);
                      const isBaseline = ver.versionNumber === 1;

                      let badgeText = "HISTORICAL";
                      let badgeVariant: "default" | "secondary" | "outline" = "outline";
                      let badgeClassName = "text-[10px] h-4.5 px-1.5 font-normal text-muted-foreground";
                      let subtitleText = "Historical snapshot";

                      if (isVerPublished && isLatest) {
                        badgeText = "CURRENT · PUBLISHED";
                        badgeVariant = "outline";
                        badgeClassName =
                          "text-[10px] h-4.5 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30";
                        subtitleText = "Latest saved & live version";
                      } else if (isLatest && !isVerPublished) {
                        badgeText = "CURRENT DRAFT";
                        badgeVariant = "secondary";
                        badgeClassName = "text-[10px] h-4.5 px-1.5 font-medium";
                        subtitleText = "Active editable draft";
                      } else if (isVerPublished) {
                        badgeText = "PUBLISHED";
                        badgeVariant = "outline";
                        badgeClassName =
                          "text-[10px] h-4.5 px-1.5 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
                        subtitleText = "Previously published snapshot";
                      } else if (isBaseline) {
                        badgeText = "INITIAL";
                        badgeVariant = "outline";
                        badgeClassName = "text-[10px] h-4.5 px-1.5 font-medium text-muted-foreground";
                        subtitleText = "Initial baseline";
                      }

                      return (
                        <button
                          key={ver.id}
                          type="button"
                          onClick={() => handleSelectVersion(ver)}
                          className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                            isSelected
                              ? "bg-primary/10 border-primary/40 shadow-xs ring-1 ring-primary/20"
                              : "hover:bg-muted/60 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-sm text-foreground">
                              Version {ver.versionNumber}
                            </span>
                            <Badge
                              variant={badgeVariant}
                              className={badgeClassName}
                            >
                              {isVerPublished && <IconWorld className="size-2.5 mr-1 inline" />}
                              {badgeText}
                            </Badge>
                          </div>

                          <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                            <IconClock className="size-3 shrink-0" />
                            <span className="truncate">
                              {formatRelativeTimestamp(ver.createdAt)}
                            </span>
                          </div>

                          <div className="text-[11px] text-muted-foreground/80 truncate">
                            {subtitleText}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Selected Snapshot Detail & Preview */}
            <div className="flex-1 flex flex-col bg-background min-w-0">
              {isDetailLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <IconLoader className="size-6 animate-spin text-primary" />
                  <span className="text-sm">Loading snapshot details...</span>
                </div>
              ) : selectedVersion ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Top Bar for Selected Version */}
                  <div className="p-4 sm:p-5 border-b bg-muted/10 flex items-center justify-between gap-4 shrink-0">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">
                          Version {selectedVersion.versionNumber}
                        </h3>
                        {selectedVersion.versionNumber === currentVersionNumber && (
                          <Badge variant="secondary" className="text-xs">
                            Active Version
                          </Badge>
                        )}
                        {isSelectedPublished && (
                          <Badge
                            variant="outline"
                            className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1"
                          >
                            <IconWorld className="size-3" />
                            Live Snapshot
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <IconClock className="size-3.5 text-muted-foreground" />
                        Saved on {formatRelativeTimestamp(selectedVersion.createdAt)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant={isCurrentDraft ? "outline" : "default"}
                      size="sm"
                      disabled={isCurrentDraft || isRestoring}
                      onClick={() => setIsConfirmOpen(true)}
                      className="gap-1.5 shrink-0"
                    >
                      {isRestoring ? (
                        <IconLoader className="size-4 animate-spin" />
                      ) : (
                        <IconRotateClockwise2 className="size-4" />
                      )}
                      <span>
                        {isCurrentDraft ? "Current Version" : "Restore this version"}
                      </span>
                    </Button>
                  </div>

                  {/* Read-Only Notice */}
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2 shrink-0">
                    <IconAlertCircle className="size-4 shrink-0" />
                    <span>
                      Viewing read-only snapshot. Restoring this version will create Version{" "}
                      {latestVersionNumber + 1} without altering past history records.
                    </span>
                  </div>

                  {/* Snapshot Form Content Preview */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                      {/* Form Metadata */}
                      <div className="space-y-2 border-b pb-4">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                          {selectedVersion.title || "Untitled Form"}
                        </h1>
                        {selectedVersion.description ? (
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {selectedVersion.description}
                          </p>
                        ) : (
                          <p className="text-xs italic text-muted-foreground">
                            No description provided
                          </p>
                        )}
                      </div>

                      {/* Elements List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <IconFileText className="size-3.5" />
                            Questions & Blocks ({selectedElements.length})
                          </span>
                        </div>

                        {selectedElements.length === 0 ? (
                          <div className="p-8 text-center border rounded-xl bg-muted/20 text-muted-foreground text-xs">
                            This version contained zero questions or blocks.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedElements.map((el, idx) => (
                              <div
                                key={el.id}
                                className="p-4 rounded-xl border bg-card/60 space-y-2 text-xs shadow-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] text-muted-foreground">
                                      #{idx + 1}
                                    </span>
                                    <span className="font-semibold text-foreground text-sm truncate">
                                      {el.label || el.content || "(Untitled block)"}
                                    </span>
                                    {el.required && (
                                      <span className="text-destructive font-bold">
                                        *
                                      </span>
                                    )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="capitalize text-[10px] shrink-0 font-normal"
                                  >
                                    {el.type.replace(/_/g, " ")}
                                  </Badge>
                                </div>

                                {el.helpText && (
                                  <p className="text-muted-foreground text-[11px]">
                                    {el.helpText}
                                  </p>
                                )}

                                {/* Options preview if present in config */}
                                {Array.isArray(
                                  (el.config as any)?.options
                                ) && (el.config as any).options.length > 0 && (
                                  <div className="pt-2 pl-4 border-l-2 space-y-1">
                                    {(el.config as any).options.map(
                                      (opt: any, oIdx: number) => (
                                        <div
                                          key={opt.id || oIdx}
                                          className="text-muted-foreground flex items-center gap-1.5 text-[11px]"
                                        >
                                          <span className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                                          <span className="truncate">{opt.label || opt.value}</span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground text-sm">
                  Select a version to inspect its snapshot details.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Restoration */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restore Version {selectedVersion?.versionNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will restore the title, description, settings, and questions
                from <strong>Version {selectedVersion?.versionNumber}</strong> as
                your active form state.
              </p>
              <div className="p-3 rounded-lg border bg-muted/40 text-xs text-muted-foreground space-y-1.5">
                <p>
                  • A new snapshot (<strong>Version {latestVersionNumber + 1}</strong>)
                  will be created based on Version {selectedVersion?.versionNumber}.
                </p>
                <p>
                  • Your existing version history remains completely safe and immutable.
                </p>
                {isFormCurrentlyPublished ? (
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    • Note: Because this form is currently published, restoring this version
                    will immediately make it live for public respondents.
                  </p>
                ) : (
                  <p>
                    • The restored version will become your active draft and will not be live
                    until you publish it.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmRestore();
              }}
              disabled={isRestoring}
              className="gap-1.5"
            >
              {isRestoring && <IconLoader className="size-4 animate-spin" />}
              <span>Confirm & Restore</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
