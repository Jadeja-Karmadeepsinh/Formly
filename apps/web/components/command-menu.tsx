"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  IconFileText,
  IconHelp,
  IconMoon,
  IconPlus,
  IconSettings,
  IconSun,
} from "@tabler/icons-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import { type FormItem, useForms } from "~/hooks/api/form";
import { Badge } from "~/components/ui/badge";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreateForm?: () => void;
}

export function CommandMenu({
  open,
  onOpenChange,
  onOpenCreateForm,
}: CommandMenuProps) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { forms } = useForms();

  // Handle global shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Toggle command dialog on ⌘K or Ctrl+K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }

      // Quick create shortcut: press "c" when not in an input
      if (
        e.key.toLowerCase() === "c" &&
        !open &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        !(document.activeElement as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        onOpenCreateForm?.();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange, onOpenCreateForm]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Formly Quick Command"
      description="Search forms, navigate, or trigger actions"
    >
      <CommandInput placeholder="Type a command or search forms..." />
      <CommandList className="max-h-[360px]">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* 1. Quick Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                onOpenCreateForm?.();
              })
            }
            className="gap-2.5 cursor-pointer"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconPlus className="size-3.5" />
            </div>
            <span>Create New Form</span>
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              })
            }
            className="gap-2.5 cursor-pointer"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {resolvedTheme === "dark" ? (
                <IconSun className="size-3.5" />
              ) : (
                <IconMoon className="size-3.5" />
              )}
            </div>
            <span>
              Switch to {resolvedTheme === "dark" ? "Light" : "Dark"} Theme
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* 2. Your Forms (Dynamically searched) */}
        {forms && forms.length > 0 && (
          <CommandGroup heading="Your Forms">
            {forms.map((form: FormItem) => (
              <CommandItem
                key={form.id}
                value={`${form.title} ${form.description || ""} ${form.status}`}
                onSelect={() =>
                  runCommand(() => {
                    router.push(`/dashboard/forms/${form.id}`);
                  })
                }
                className="gap-2.5 cursor-pointer justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted/30">
                    <IconFileText className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-foreground truncate text-sm">
                      {form.title}
                    </span>
                    {form.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {form.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant={form.status === "published" ? "default" : "secondary"}
                    className={
                      form.status === "published"
                        ? "bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] h-4.5 px-1.5"
                        : "text-[10px] h-4.5 px-1.5"
                    }
                  >
                    {form.status}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* 3. Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                router.push("/dashboard");
              })
            }
            className="gap-2.5 cursor-pointer"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <IconFileText className="size-3.5" />
            </div>
            <span>Overview & Forms</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                router.push("/dashboard/settings/account");
              })
            }
            className="gap-2.5 cursor-pointer"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <IconSettings className="size-3.5" />
            </div>
            <span>Account & Security Settings</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                window.open("/docs", "_blank");
              })
            }
            className="gap-2.5 cursor-pointer"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <IconHelp className="size-3.5" />
            </div>
            <span>Documentation</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
