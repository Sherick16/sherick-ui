"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import React, { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { overlay, stacking, text, type } from "./ui.common";
import { motionPresenceTooltip } from "./ui.motion";
import type { OverlayAlign } from "./ui.types";

export interface TooltipProps {
  /** The trigger. The hint attaches to this element directly: no wrapper is rendered around it. */
  children: ReactElement;
  content: ReactNode;
  /** Adds to the trigger element. */
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
  /** Where the hint sits along its edge. */
  align?: OverlayAlign;
}

export interface TooltipProviderProps {
  children: ReactNode;
  /** How long a hint waits on hover before it opens, in milliseconds. */
  delay?: number;
  /** How long a hint waits before it closes, in milliseconds. */
  closeDelay?: number;
  /** A hint opened within this window after another closes opens at once. Base's own default is 400ms. */
  timeout?: number;
}

/* A provider marks the subtree it covers. A tooltip beneath one shares its warm-up group, and a tooltip
   beneath none keeps its own hover delay, so a lone hint behaves as it always has. */
const TooltipGroup = createContext(false);

/**
 * Shares one warm-up across every tooltip beneath it. Hovering a hint opens it after its delay; once a
 * hint closes, the next one opens at once while the pointer stays in the group. Four adjacent icon
 * buttons therefore show their hints without a wait each time.
 */
export const TooltipProvider = ({ children, delay = 500, closeDelay = 0, timeout }: TooltipProviderProps) => (
  <TooltipGroup.Provider value={true}>
    <BaseTooltip.Provider delay={delay} closeDelay={closeDelay} timeout={timeout}>
      {children}
    </BaseTooltip.Provider>
  </TooltipGroup.Provider>
);

const Tooltip = ({ children, content, className, position = "bottom", align = "center" }: TooltipProps) => {
  const grouped = useContext(TooltipGroup);

  const root = (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} className={cn(className)} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={position} align={align} sideOffset={8} className={cn(stacking.float)}>
          <BaseTooltip.Popup
            className={cn(
              "w-max max-w-[min(16rem,var(--available-width))] whitespace-normal px-3 py-2 [overflow-wrap:anywhere]",
              type.supporting,
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
  );

  /* Without an ambient provider the hint keeps its own 500ms hover delay, as it always has. */
  return grouped ? root : <BaseTooltip.Provider delay={500} closeDelay={0}>{root}</BaseTooltip.Provider>;
};

export default Tooltip;
