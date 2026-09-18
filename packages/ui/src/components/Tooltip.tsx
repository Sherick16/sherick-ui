"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import React, { type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { motion, overlay, stacking, text } from "./ui.common";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
}

const Tooltip = ({ children, content, className, position = "bottom" }: TooltipProps) => {
  return (
    <BaseTooltip.Provider delay={0} closeDelay={0}>
      <BaseTooltip.Root>
        <span className={cn("inline-block", className)}>
          <BaseTooltip.Trigger render={children} />
        </span>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={position} sideOffset={8} className={cn(stacking.float)}>
            <BaseTooltip.Popup
              className={({ open }) =>
                cn(
                  "w-max max-w-64 whitespace-normal px-3 py-2 text-xs leading-5",
                  overlay.tooltip,
                  text.high,
                  open ? motion.overlayIn : motion.overlayOut
                )
              }
            >
              {content}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
};

export default Tooltip;
