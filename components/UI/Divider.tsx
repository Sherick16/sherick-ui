import React from "react";
import { cn } from "@/libs/utils";
import { edge } from "./ui.common";

/* A divider is the structural edge tone used as a rule instead of a rim, so it stays
   consistent with every other hairline in the library. */
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
      "shrink-0",
      orientation === "horizontal" ? "h-0 w-full border-t" : "h-full w-0 border-l",
      edge.rule,
      className
    )}
  />
);

export default Divider;
