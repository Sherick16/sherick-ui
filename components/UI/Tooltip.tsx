"use client";

import React, { useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
}

const positionClass = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
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
            "absolute z-10 p-2 rounded-lg backdrop-blur-lg min-w-32 bg-gray-600 bg-opacity-50 shadow-lg text-sm animate-fade",
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
