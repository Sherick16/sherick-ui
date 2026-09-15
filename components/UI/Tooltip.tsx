"use client";

import React, { useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { elevation, material, motion, shape, text } from "./ui.common";
import { useOverlayPresence } from "./useOverlayPresence";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
}

/* Sizing is intrinsic (`w-max`) because a `left-1/2` offset halves the shrink-to-fit
   width available to an absolutely positioned box — the tooltip wrapped every label at
   ~half the trigger width. Centering stays on `-translate-x-1/2` since auto margins
   collapse when the tooltip is wider than the trigger.
   Each position sets where the overlay motion family starts from: a tooltip grows out
   of the edge it is anchored to, so a label below its trigger drops into place and one
   above it rises. */
const positionClass = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2 origin-bottom [--sui-overlay-from-lift:4px]",
  right: "left-full top-1/2 ml-2 -translate-y-1/2 origin-left [--sui-overlay-from-lift:0px]",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2 origin-top [--sui-overlay-from-lift:-4px]",
  left: "right-full top-1/2 mr-2 -translate-y-1/2 origin-right [--sui-overlay-from-lift:0px]",
} as const;

const Tooltip = ({ children, content, className, position = "bottom" }: TooltipProps) => {
  const id = useId();
  const [show, setShow] = useState(false);
  const { mounted, closing, onExitEnd } = useOverlayPresence(show);
  const tooltipId = `tooltip-${id}`;

  const trigger = React.cloneElement(children, {
    "aria-describedby": show ? tooltipId : undefined,
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <span
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocusCapture={() => setShow(true)}
      onBlurCapture={() => setShow(false)}
    >
      {trigger}
      {mounted && (
        <span
          id={tooltipId}
          role="tooltip"
          aria-hidden={closing || undefined}
          onAnimationEnd={onExitEnd}
          className={cn(
            "absolute z-40 w-max max-w-64 whitespace-normal px-3 py-2 text-xs leading-5",
            shape.prominent,
            material.acrylicDense,
            elevation.floating,
            text.high,
            positionClass[position],
            closing ? cn(motion.overlayOut, "pointer-events-none") : motion.overlayIn
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
