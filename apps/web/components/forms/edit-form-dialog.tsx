"use client";

import * as React from "react";
import { IconLoader } from "@tabler/icons-react";
import { type FormItem, useUpdateForm } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface EditFormDialogProps {
  form: FormItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFormDialog({ form, open, onOpenChange }: EditFormDialogProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<"draft" | "published" | "closed" | "archived">("draft");
  const [visibility, setVisibility] = React.useState<"unlisted" | "public">("unlisted");
  const [maxSubmissions, setMaxSubmissions] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [submitButtonText, setSubmitButtonText] = React.useState("Submit");
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = React.useState(true);
  const [showProgressBar, setShowProgressBar] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const { updateFormAsync, isPending } = useUpdateForm();

  React.useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description ?? "");
      setStatus(form.status);
      setVisibility(form.visibility);
      setMaxSubmissions(form.maxSubmissions !== null && form.maxSubmissions !== undefined ? String(form.maxSubmissions) : "");
      
      if (form.expiresAt) {
        try {
          const d = new Date(form.expiresAt);
          // Format as YYYY-MM-DDTHH:MM for datetime-local
          const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setExpiresAt(iso);
        } catch {
          setExpiresAt("");
        }
      } else {
        setExpiresAt("");
      }

      const settings = (form.settings ?? {}) as Record<string, unknown>;
      setSubmitButtonText(typeof settings.submitButtonText === "string" ? settings.submitButtonText : "Submit");
      setAllowMultipleSubmissions(typeof settings.allowMultipleSubmissions === "boolean" ? settings.allowMultipleSubmissions : true);
      setShowProgressBar(typeof settings.showProgressBar === "boolean" ? settings.showProgressBar : false);
      setValidationError(null);
    }
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setValidationError("Form title is required");
      return;
    }

    setValidationError(null);

    try {
      await updateFormAsync({
        id: form.id,
        title: cleanTitle,
        description: description.trim() ? description.trim() : null,
        status,
        visibility,
        maxSubmissions: maxSubmissions ? parseInt(maxSubmissions, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        settings: {
          submitButtonText: submitButtonText.trim() || "Submit",
          allowMultipleSubmissions,
          showProgressBar,
        },
      });

      onOpenChange(false);
    } catch {
      // Error handled by mutation hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Edit Form</DialogTitle>
            <DialogDescription>
              Update your form title, status, visibility, and configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
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
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(val) =>
                    setStatus(val as "draft" | "published" | "closed" | "archived")
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-visibility" className="text-sm font-medium">
                  Visibility
                </Label>
                <Select
                  value={visibility}
                  onValueChange={(val) => setVisibility(val as "unlisted" | "public")}
                  disabled={isPending}
                >
                  <SelectTrigger id="edit-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlisted">Unlisted (link only)</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-max-submissions" className="text-sm font-medium">
                  Max Submissions
                </Label>
                <Input
                  id="edit-max-submissions"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Unlimited"
                  value={maxSubmissions}
                  onChange={(e) => setMaxSubmissions(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-expires-at" className="text-sm font-medium">
                  Expiry Date & Time
                </Label>
                <Input
                  id="edit-expires-at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            <Separator className="my-1" />

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Form Settings
              </span>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-submit-text" className="text-xs font-medium">
                  Submit Button Label
                </Label>
                <Input
                  id="edit-submit-text"
                  placeholder="Submit"
                  value={submitButtonText}
                  onChange={(e) => setSubmitButtonText(e.target.value)}
                  disabled={isPending}
                  className="h-8 text-sm"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-allow-multiple" className="text-sm font-medium cursor-pointer">
                    Allow Multiple Submissions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow respondents to submit more than once.
                  </p>
                </div>
                <Switch
                  id="edit-allow-multiple"
                  checked={allowMultipleSubmissions}
                  onCheckedChange={setAllowMultipleSubmissions}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-progress-bar" className="text-sm font-medium cursor-pointer">
                    Show Progress Bar
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display completion percentage to respondents.
                  </p>
                </div>
                <Switch
                  id="edit-progress-bar"
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <IconLoader className="size-4 animate-spin" />}
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

