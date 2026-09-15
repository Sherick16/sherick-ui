import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export const ModalHeader = ({ children, className }: ModalHeaderProps) => {
  return (
    <div className={cn("px-6 pb-2 pt-6 pr-18 sm:px-7", className)}>
      <div id="modal-title" className="text-xl font-semibold tracking-[-0.02em] text-sherick-ink">
        {children}
      </div>
    </div>
  );
};
