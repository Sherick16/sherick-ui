import React, { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { iconSlot, shape, text, tone, type } from "./ui.common";
import { Variant } from "./ui.types";

/**
 * `default` is the badge as it has always been: a soft capsule with full-ink copy. `subtle` is a tag set
 * inside a row of content, such as a reason in a table cell: the role's soft tint with the role's own
 * tone as its copy, at the supporting type step, in a rounded rectangle rather than a capsule.
 */
export type BadgeAppearance = "default" | "subtle";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: Variant;
  /** The badge's weight: the standalone capsule, or the lighter tag for a row of content. */
  appearance?: BadgeAppearance;
  icon?: ReactNode;
}

/* A subtle badge carries its meaning in its colour, so its copy takes the role's tone on the role's tint
   (measured as `tone.text.<role> on its own tint`). It labels the row it sits in rather than acting, so it
   takes the `tag` corner. It is 20px, the line height of a table cell, so a row with a tag is as tall as a
   row without one. */
const appearanceClass: Record<BadgeAppearance, (variant: Variant) => string[]> = {
  default: (variant) => [
    "inline-flex min-h-7 min-w-0 max-w-full items-center justify-center gap-1.5 px-3 py-1 font-semibold",
    type.caption,
    shape.pill,
    tone.soft[variant],
    text.high,
  ],
  subtle: (variant) => [
    "inline-flex min-h-5 min-w-0 max-w-full items-center justify-center gap-1.5 px-2 font-medium",
    type.supporting,
    shape.tag,
    tone.soft[variant],
  ],
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = "secondary", appearance = "default", icon, className, ...props }, ref) => {
    return (
      <span
        {...props}
        ref={ref}
        className={cn(...appearanceClass[appearance](variant), className)}
      >
        {/* A badge gives its leading mark one predictable slot: 14px, held at that size whatever artwork
            a caller hands in, with the box — not the artwork's own whitespace — aligned to the label. */}
        {icon && (
          <span className={cn(iconSlot.caption, tone.text[variant])} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={cn("min-w-0 truncate")}>{children}</span>
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
