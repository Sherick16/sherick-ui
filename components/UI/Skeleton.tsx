import React from "react";
import { cn } from "@/libs/utils";
import { shape } from "./ui.common";

export const Skeleton = ({ className, ...props }: { className?: string }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-700/50 motion-reduce:animate-none",
        shape.control,
        className
      )}
      {...props}
    />
  );
};
