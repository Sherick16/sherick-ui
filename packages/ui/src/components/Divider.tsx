"use client";

import { Separator } from "@base-ui/react/separator";
import React from "react";
import { cn } from "@/libs/utils";
import { edgeTone } from "./ui.common";

/**
 * Which structural line the divider draws. The three are one tone at three strengths — the line
 * between the rows of a stacked list, the general break inside a surface, and the rule beneath a
 * column header — so a caller names the join it is drawing rather than picking an opacity.
 */
export type DividerWeight = keyof typeof edgeTone;

export interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  /** The weight of the line. `rule` is the general section break. */
  weight?: DividerWeight;
}

const Divider = ({ className, orientation = "horizontal", weight = "rule" }: DividerProps) => (
  <Separator
    orientation={orientation}
    className={cn(
      "shrink-0",
      orientation === "horizontal" ? "h-0 w-full border-t" : "h-full w-0 border-l",
      edgeTone[weight],
      className
    )}
  />
);

export default Divider;
