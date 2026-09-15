import React, { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { shape, toneSoftMap } from "./ui.common";
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
        toneSoftMap[variant],
        className
      )}
    >
      {icon && <span className="inline-flex items-center" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
