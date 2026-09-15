"use client";

import React, { useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  className?: string;
}

const Tooltip = ({ children, content, className }: TooltipProps) => {
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
          className="absolute z-10 p-2 mt-2 origin-top-right rounded-lg backdrop-blur-lg min-w-32 w-full bg-gray-600 bg-opacity-50 shadow-lg text-sm animate-fade"
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
