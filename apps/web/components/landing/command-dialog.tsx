"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  FileText,
  Sparkles,
  Layers,
  Workflow,
  HelpCircle,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Laptop,
  Table,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";

interface LandingCommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LandingCommandMenu({
  open,
  onOpenChange,
}: LandingCommandMenuProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  // Handle global shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

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
      title="Formly Navigation & Actions"
      description="Search landing page sections and common actions"
    >
      <CommandInput placeholder="Search sections, features, or actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Page Sections">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              })
            }
          >
            <Sparkles className="mr-2 size-4 text-muted-foreground" />
            <span>01 / Features & Core Capabilities</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document
                  .getElementById("builder-deep-dive")
                  ?.scrollIntoView({ behavior: "smooth" });
              })
            }
          >
            <FileText className="mr-2 size-4 text-muted-foreground" />
            <span>02 / Document-First Builder</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document
                  .getElementById("workflow")
                  ?.scrollIntoView({ behavior: "smooth" });
              })
            }
          >
            <Workflow className="mr-2 size-4 text-muted-foreground" />
            <span>03 / Workflow & Engine Steps</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document
                  .getElementById("templates")
                  ?.scrollIntoView({ behavior: "smooth" });
              })
            }
          >
            <Layers className="mr-2 size-4 text-muted-foreground" />
            <span>04 / Use Cases & Templates</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document
                  .getElementById("comparison")
                  ?.scrollIntoView({ behavior: "smooth" });
              })
            }
          >
            <Table className="mr-2 size-4 text-muted-foreground" />
            <span>05 / Architectural Comparison</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document
                  .getElementById("faq")
                  ?.scrollIntoView({ behavior: "smooth" });
              })
            }
          >
            <HelpCircle className="mr-2 size-4 text-muted-foreground" />
            <span>06 / Frequently Asked Questions</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/signup"))}>
            <UserPlus className="mr-2 size-4 text-muted-foreground" />
            <span>Create Free Account</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/login"))}>
            <LogIn className="mr-2 size-4 text-muted-foreground" />
            <span>Sign In to Dashboard</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 size-4 text-muted-foreground" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 size-4 text-muted-foreground" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop className="mr-2 size-4 text-muted-foreground" />
            <span>System Default</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
