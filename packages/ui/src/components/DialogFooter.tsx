import React, { forwardRef } from "react";
import { cn } from "@/libs/utils";
import type { PartProps } from "./ui.types";

/** The footer's own `div`, which holds the dialog's actions. */
export type DialogFooterProps = PartProps<"div">;

/* Actions stay on the dialog's own surface: no divider, no second layer. */
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(({ children, className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cn(
      "mt-auto flex flex-wrap items-center justify-end gap-3 px-6 pb-5 pt-1 sm:px-7",
      className
    )}
  >
    {children}
  </div>
));

DialogFooter.displayName = "DialogFooter";
