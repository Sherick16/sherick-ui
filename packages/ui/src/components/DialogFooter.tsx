import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";

export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

/* Actions stay on the dialog's own surface: no divider, no second layer. */
export const DialogFooter = ({ children, className }: DialogFooterProps) => {
  return (
    <div
      className={cn(
        "mt-auto flex items-center justify-end gap-3 px-6 pb-5 pt-1 sm:px-7",
        className
      )}
    >
      {children}
    </div>
  );
};
