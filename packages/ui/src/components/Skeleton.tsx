import React, { type HTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { material, shape } from "./ui.common";
import { motionActivityPulse } from "./ui.motion";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/* Loading feedback reports progress rather than answering an event, so it is its own intent
   rather than an exception to interaction motion; under reduced motion it is a static block. */
export const Skeleton = ({ className, "aria-hidden": ariaHidden = true, ...props }: SkeletonProps) => {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(
        motionActivityPulse,
        material.matteHigh,
        shape.control,
        className
      )}
      {...props}
    />
  );
};
