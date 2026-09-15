"use client";

import React, { useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { shape, surface } from "./ui.common";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
}

const positionClass = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2 origin-bottom",
  right: "left-full top-1/2 ml-2 -translate-y-1/2 origin-left",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2 origin-top",
  left: "right-full top-1/2 mr-2 -translate-y-1/2 origin-right",
} as const;

const Tooltip = ({ children, content, className, position = "bottom" }: TooltipProps) => {
  const id = useId();
  const [show, setShow] = useState(false);
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
      {show && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            "absolute z-40 max-w-64 whitespace-normal px-3 py-2 text-xs leading-5 text-sherick-ink/92",
            shape.control,
            surface.acrylicDense,
            "animate-menu motion-reduce:animate-none",
            positionClass[position]
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
