"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Link2,
  Loader2,
} from "lucide-react";
import { useCreateForm } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";

interface CreateFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  initialTitle?: string;
  initialDescription?: string;
}

export function CreateFormDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
  initialTitle = "",
  initialDescription = "",
}: CreateFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState(initialDescription);
  const [visibility, setVisibility] = React.useState<"unlisted" | "public">("unlisted");
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Advanced settings
  const [maxSubmissions, setMaxSubmissions] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [submitButtonText, setSubmitButtonText] = React.useState("Submit");
  const [showProgressBar, setShowProgressBar] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const { createFormAsync, isPending } = useCreateForm();

  React.useEffect(() => {
    if (open) {
      if (initialTitle) setTitle(initialTitle);
      if (initialDescription) setDescription(initialDescription);
    }
  }, [open, initialTitle, initialDescription]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVisibility("unlisted");
    setMaxSubmissions("");
    setExpiresAt("");
    setSubmitButtonText("Submit");
    setShowProgressBar(false);
    setShowAdvanced(false);
    setValidationError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setValidationError("Please enter a title for your form");
      return;
    }

    setValidationError(null);

    try {
      const created = await createFormAsync({
        title: cleanTitle,
        description: description.trim() ? description.trim() : null,
        visibility,
        maxSubmissions: maxSubmissions ? parseInt(maxSubmissions, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        settings: {
          submitButtonText: submitButtonText.trim() || "Submit",
          showProgressBar,
        },
      });

      handleOpenChange(false);
      if (created?.id) {
        router.push(`/dashboard/forms/${created.id}`);
      }
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Create New Form
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Give your form a name to start building in the editor.
            </DialogDescription>
          </DialogHeader>

          {/* Form Title */}
          <div className="space-y-1.5">
            <Label htmlFor="form-title" className="text-xs font-medium text-foreground">
              Form Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="form-title"
              placeholder="e.g. Customer Feedback, Team Standup..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              autoFocus
              className="h-9 text-sm rounded-lg"
            />
            {validationError && (
              <p className="text-[11px] font-medium text-destructive">
                {validationError}
              </p>
            )}
          </div>

          {/* Form Description */}
          <div className="space-y-1.5">
            <Label htmlFor="form-description" className="text-xs font-medium text-foreground">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="form-description"
              placeholder="Brief summary of what this form is collecting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-xs rounded-lg resize-none"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <Label htmlFor="form-visibility" className="text-xs font-medium text-foreground">
              Access Visibility
            </Label>
            <Select
              value={visibility}
              onValueChange={(val: "unlisted" | "public") => setVisibility(val)}
            >
              <SelectTrigger id="form-visibility" className="h-9 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="unlisted" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Link2 className="size-3.5 text-muted-foreground" />
                    <span>Unlisted (Anyone with link)</span>
                  </div>
                </SelectItem>
                <SelectItem value="public" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Globe className="size-3.5 text-muted-foreground" />
                    <span>Public (Discoverable)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collapsible Advanced Settings */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
            >
              {showAdvanced ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
              <span>{showAdvanced ? "Hide Advanced Settings" : "Advanced Settings"}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="max-sub" className="text-[11px] text-muted-foreground">
                      Max Responses
                    </Label>
                    <Input
                      id="max-sub"
                      type="number"
                      placeholder="Unlimited"
                      min={1}
                      value={maxSubmissions}
                      onChange={(e) => setMaxSubmissions(e.target.value)}
                      className="h-8 text-xs rounded-md"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="btn-text" className="text-[11px] text-muted-foreground">
                      Submit Button Label
                    </Label>
                    <Input
                      id="btn-text"
                      placeholder="Submit"
                      value={submitButtonText}
                      onChange={(e) => setSubmitButtonText(e.target.value)}
                      className="h-8 text-xs rounded-md"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="progress-bar" className="text-xs text-foreground cursor-pointer">
                      Show Progress Bar
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Display completion percentage to respondents
                    </p>
                  </div>
                  <Switch
                    id="progress-bar"
                    checked={showProgressBar}
                    onCheckedChange={setShowProgressBar}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="rounded-lg text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-2 rounded-lg text-xs font-medium shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create & Open Editor</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
