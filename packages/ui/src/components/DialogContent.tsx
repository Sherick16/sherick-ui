"use client";

import React, { forwardRef } from "react";
import { cn } from "@/libs/utils";
import { headingRhythm, text, type } from "./ui.common";
import type { PartProps } from "./ui.types";

/** The body's own `div`. It keeps the body meaning it has always had. */
export type DialogContentProps = PartProps<"div">;

/* The body opens on the same 8px rhythm the description takes below a heading, so it is never flush
   against the header or the description before it, and it carries no top padding of its own. */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(({ children, className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cn("px-6 pb-5 sm:px-7", headingRhythm.heading, type.body, text.medium, className)}
  >
    {children}
  </div>
));

DialogContent.displayName = "DialogContent";
