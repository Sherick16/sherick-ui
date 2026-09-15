import React from "react";
import { cn } from "@/libs/utils";

const Divider = ({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) => (
  <div
    aria-hidden="true"
    className={cn(
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      "bg-sherick-ink/[0.075]",
      className
    )}
  />
);

export default Divider;
