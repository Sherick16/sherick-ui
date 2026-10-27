"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { forwardRef } from "react";
import { cn } from "@/libs/utils";
import { text, type } from "./ui.common";
import type { PartProps } from "./ui.types";

/** The header's own `div`. Its children are the title: Base names the surface from them. */
export type DialogHeaderProps = PartProps<"div">;

/* The header takes no bottom padding: the gap below the title belongs to the supporting line that
   follows it (`headingRhythm.heading`), so the header and its description cannot drift apart. */
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(({ children, className, ...props }, ref) => (
  <div {...props} ref={ref} className={cn("pt-5 ps-6 pe-16 sm:ps-7", className)}>
    <BaseDialog.Title className={cn("m-0", type.heading, text.high)}>
      {children}
    </BaseDialog.Title>
  </div>
));

DialogHeader.displayName = "DialogHeader";
