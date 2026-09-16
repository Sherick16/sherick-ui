import React, { type HTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { material, shape } from "./ui.common";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/* Loading feedback sits outside the interaction motion families: it reports progress
   rather than responding to a press, so it keeps its own loop. */
export const Skeleton = ({ className, "aria-hidden": ariaHidden = true, ...props }: SkeletonProps) => {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(
        "animate-pulse motion-reduce:animate-none",
        material.matteHigh,
        shape.control,
        className
      )}
      {...props}
    />
  );
};
