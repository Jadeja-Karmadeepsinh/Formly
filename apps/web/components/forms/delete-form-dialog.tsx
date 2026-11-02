"use client";

import * as React from "react";
import { IconLoader, IconTrash } from "@tabler/icons-react";
import { type FormItem, useDeleteForm } from "~/hooks/api/form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface DeleteFormDialogProps {
  form: FormItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteFormDialog({ form, open, onOpenChange }: DeleteFormDialogProps) {
  const { deleteFormAsync, isPending } = useDeleteForm();

  const handleDelete = async () => {
    if (!form) return;
    try {
      await deleteFormAsync({ id: form.id });
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <IconTrash className="size-5" />
            <span>Delete Form</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{form?.title ?? "this form"}</strong>?
            </span>
            <span className="block text-xs text-muted-foreground">
              This action will remove the form and prevent any new submissions. The form will no longer be visible on your dashboard.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <IconLoader className="size-4 animate-spin" />}
            <span>Delete Form</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

