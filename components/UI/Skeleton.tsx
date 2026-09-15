import React from "react";
import { cn } from "@/libs/utils";
import { material, shape } from "./ui.common";

/* Loading feedback sits outside the interaction motion families: it reports progress
   rather than responding to a press, so it keeps its own loop. */
export const Skeleton = ({ className, ...props }: { className?: string }) => {
  return (
    <div
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
