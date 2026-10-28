"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/utils";
import { headingRhythm, text, type } from "./ui.common";

/** The supporting line's own `p`, as Base renders it. */
export type DialogDescriptionProps = ComponentPropsWithoutRef<typeof BaseDialog.Description>;

/* The one gap between a heading and the line under it is the heading rhythm's, and it sits here on the
   supporting line rather than on the header, so the description owns its own top edge. */
export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(({ className, ...props }, ref) => (
  <BaseDialog.Description
    ref={ref}
    className={cn("px-6 sm:px-7", headingRhythm.heading, type.body, text.medium, className)}
    {...props}
  />
));

DialogDescription.displayName = "DialogDescription";
