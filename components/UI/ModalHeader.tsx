import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { text } from "./ui.common";

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export const ModalHeader = ({ children, className }: ModalHeaderProps) => {
  return (
    <div className={cn("px-6 pb-2 pt-6 pr-20 sm:px-7", className)}>
      <div id="modal-title" className={cn("text-xl font-semibold tracking-[-0.02em]", text.high)}>
        {children}
      </div>
    </div>
  );
};
