"use client";

import * as React from "react";
import { IconLoader, IconPlus } from "@tabler/icons-react";
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
import { Separator } from "~/components/ui/separator";

interface CreateFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateFormDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: CreateFormDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<"unlisted" | "public">("unlisted");
  const [maxSubmissions, setMaxSubmissions] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [submitButtonText, setSubmitButtonText] = React.useState("Submit");
  const [showProgressBar, setShowProgressBar] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const { createFormAsync, isPending } = useCreateForm();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVisibility("unlisted");
    setMaxSubmissions("");
    setExpiresAt("");
    setSubmitButtonText("Submit");
    setShowProgressBar(false);
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
      setValidationError("Form title is required");
      return;
    }

    setValidationError(null);

    try {
      await createFormAsync({
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
    } catch {
      // Error is toasted by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <IconPlus className="size-4" />
            <span>Create Form</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Set up a new form to start collecting responses. You can customize fields and themes later.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="form-title"
                placeholder="e.g. Customer Feedback Survey"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isPending}
                required
              />
              {validationError && (
                <p className="text-destructive text-xs">{validationError}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="form-description"
                placeholder="Briefly describe what this form is for..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-visibility" className="text-sm font-medium">
                  Visibility
                </Label>
                <Select
                  value={visibility}
                  onValueChange={(val) => setVisibility(val as "unlisted" | "public")}
                  disabled={isPending}
                >
                  <SelectTrigger id="form-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlisted">Unlisted (link only)</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-max-submissions" className="text-sm font-medium">
                  Max Submissions
                </Label>
                <Input
                  id="form-max-submissions"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Unlimited"
                  value={maxSubmissions}
                  onChange={(e) => setMaxSubmissions(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-expires-at" className="text-sm font-medium">
                Expiry Date & Time (Optional)
              </Label>
              <Input
                id="form-expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                disabled={isPending}
              />
            </div>

            <Separator className="my-1" />

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Initial Settings
              </span>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-submit-text" className="text-xs font-medium">
                  Submit Button Label
                </Label>
                <Input
                  id="form-submit-text"
                  placeholder="Submit"
                  value={submitButtonText}
                  onChange={(e) => setSubmitButtonText(e.target.value)}
                  disabled={isPending}
                  className="h-8 text-sm"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="form-progress-bar" className="text-sm font-medium cursor-pointer">
                    Show Progress Bar
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display completion progress to respondents.
                  </p>
                </div>
                <Switch
                  id="form-progress-bar"
                  checked={showProgressBar}
                  onCheckedChange={setShowProgressBar}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <IconLoader className="size-4 animate-spin" />}
              <span>Create Form</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
