import React, { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { shape, tone } from "./ui.common";
import { Variant } from "./ui.types";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
}

const Badge = ({
  children,
  variant = "primary",
  icon,
  className,
  ...props
}: BadgeProps) => {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex min-h-7 items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold",
        shape.pill,
        tone.soft[variant],
        className
      )}
    >
      {/* A badge gives its leading mark one predictable slot: 14px, held at that size whatever artwork
          a caller hands in, with the box — not the artwork's own whitespace — aligned to the label. */}
      {icon && (
        <span className={cn("inline-flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5")} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
