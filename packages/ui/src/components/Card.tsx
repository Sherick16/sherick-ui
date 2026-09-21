import React, { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { shape, text, tone } from "./ui.common";
import { Variant } from "./ui.types";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: Variant;
}

/* A card is a large matte surface: tone separates it from the canvas, and it carries
   no elevation until something lifts it. */
export const Card = ({
  children,
  variant = "secondary",
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "min-w-0 p-6 [overflow-wrap:anywhere]",
        shape.surface,
        tone.soft[variant],
        text.high,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
