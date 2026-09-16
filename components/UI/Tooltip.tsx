"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import React, { type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { motion, overlay, text } from "./ui.common";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
}

const liftBySide = {
  top: "[--sui-overlay-from-lift:4px]",
  right: "[--sui-overlay-from-lift:0px]",
  bottom: "[--sui-overlay-from-lift:-4px]",
  left: "[--sui-overlay-from-lift:0px]",
} as const;

const Tooltip = ({ children, content, className, position = "bottom" }: TooltipProps) => {
  return (
    <BaseTooltip.Root>
      <span className={cn("inline-block", className)}>
        <BaseTooltip.Trigger render={children} delay={0} closeDelay={0} />
      </span>
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={position} sideOffset={8} className="z-40">
          <BaseTooltip.Popup
            className={({ open, side }) =>
              cn(
                "w-max max-w-64 whitespace-normal px-3 py-2 text-xs leading-5 [transform-origin:var(--transform-origin)]",
                overlay.tooltip,
                text.high,
                liftBySide[side],
                open ? motion.overlayIn : motion.overlayOut
              )
            }
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
};

export default Tooltip;
