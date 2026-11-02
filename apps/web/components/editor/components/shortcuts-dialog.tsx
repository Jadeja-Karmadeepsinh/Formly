"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Kbd } from "~/components/ui/kbd";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const shortcuts = [
    { label: "Insert block / question", keys: ["/"] },
    { label: "Save changes", keys: [modKey, "S"] },
    { label: "Preview form", keys: [modKey, "P"] },
    { label: "Bold text", keys: [modKey, "B"] },
    { label: "Italicize text", keys: [modKey, "I"] },
    { label: "Underline text", keys: [modKey, "U"] },
    { label: "Heading 1", keys: ["#", "Space"] },
    { label: "Heading 2", keys: ["##", "Space"] },
    { label: "Bullet list", keys: ["-", "Space"] },
    { label: "Numbered list", keys: ["1.", "Space"] },
    { label: "Task list", keys: ["[ ]", "Space"] },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-xs">
            Work faster in the Formly editor with these handy shortcuts.
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y divide-border/60 py-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 text-xs"
            >
              <span className="text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, kIdx) => (
                  <Kbd key={kIdx} className="text-[11px] px-1.5 py-0.5">
                    {k}
                  </Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

