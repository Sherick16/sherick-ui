import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { text } from "./ui.common";

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

/* Tight vertical rhythm: the title sits close to its body, the surface keeps its own
   padding, and no line or nested surface divides the dialog into boxes. `pr-16` clears
   the close action's hit target. */
export const ModalHeader = ({ children, className }: ModalHeaderProps) => {
  return (
    /* `pr-16` has to survive the responsive step, so each side is set on its own:
       `sm:px-7` would otherwise overwrite the clearance the close target needs. */
    <div className={cn("pt-5 pb-2 pl-6 pr-16 sm:pl-7", className)}>
      <div id="modal-title" className={cn("text-xl font-semibold tracking-[-0.02em]", text.high)}>
        {children}
      </div>
    </div>
  );
};
