"use client";

import { Separator } from "@base-ui/react/separator";
import React from "react";
import { cn } from "@/libs/utils";
import { edge } from "./ui.common";

export interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const Divider = ({ className, orientation = "horizontal" }: DividerProps) => (
  <Separator
    orientation={orientation}
    className={cn(
      "shrink-0",
      orientation === "horizontal" ? "h-0 w-full border-t" : "h-full w-0 border-l",
      edge.rule,
      className
    )}
  />
);

export default Divider;
