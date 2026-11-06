import React from "react"
import { cn } from "~/lib/utils"

export interface SkillChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  icon?: React.ReactNode
  href?: string
}

export function SkillChip({
  label,
  icon,
  href,
  className,
  ...props
}: SkillChipProps) {
  const Comp = href ? "a" : "div"
  return (
    <Comp
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "skill-inner-shadow inline-flex items-center rounded-md border border-dashed border-black/20 bg-black/5 px-2 py-1 text-xs sm:text-sm font-semibold text-black transition-all hover:border-black/40 dark:border-white/30 dark:bg-white/15 dark:text-white dark:hover:border-white/50",
        className
      )}
      {...(props as any)}
    >
      {icon && <div className="size-3.5 sm:size-4 shrink-0 mr-1.5">{icon}</div>}
      <span>{label}</span>
    </Comp>
  )
}

