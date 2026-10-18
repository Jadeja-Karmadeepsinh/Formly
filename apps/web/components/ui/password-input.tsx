"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";

export interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  /** Optional custom toggle label callback for internationalization */
  getToggleAriaLabel?: (isVisible: boolean) => string;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, getToggleAriaLabel, disabled, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  const toggleVisibility = React.useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const ariaLabel = getToggleAriaLabel
    ? getToggleAriaLabel(isVisible)
    : isVisible
    ? "Hide password"
    : "Show password";

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        className={cn("pr-10", className)}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        tabIndex={0}
        onClick={toggleVisibility}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={isVisible}
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          "touch-manipulation"
        )}
      >
        {isVisible ? (
          <EyeOff className="size-4 shrink-0" aria-hidden="true" />
        ) : (
          <Eye className="size-4 shrink-0" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
