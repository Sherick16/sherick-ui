"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import React, { type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { overlay, stacking, text } from "./ui.common";
import { motionPresenceTooltip } from "./ui.motion";

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
              className={cn(
                "w-max max-w-[min(16rem,var(--available-width))] whitespace-normal px-3 py-2 text-xs leading-5 [overflow-wrap:anywhere]",
                overlay.tooltip,
                text.high,
                motionPresenceTooltip
              )}
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
