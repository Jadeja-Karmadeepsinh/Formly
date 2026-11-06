"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8 text-muted-foreground", className)}
        aria-label="Toggle theme"
        disabled
      >
        <span className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("size-8 text-muted-foreground hover:text-foreground active:scale-90 transition-all duration-300 cursor-pointer", className)}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun className="size-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="size-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </Button>
  );
}

