import React, { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { shape, toneSoftMap } from "./ui.common";
import { Variant } from "./ui.types";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: Variant;
}

export const Card = ({
  children,
  variant = "secondary",
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "p-6",
        shape.surface,
        toneSoftMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
