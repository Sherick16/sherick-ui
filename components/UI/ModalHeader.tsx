import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export const ModalHeader = ({ children, className }: ModalHeaderProps) => {
  return (
    <div className={cn("px-6 pb-3 pt-7 pr-20 sm:px-7 sm:pt-8", className)}>
      <div id="modal-title" className="text-2xl font-semibold tracking-[-0.025em] text-sherick-ink">
        {children}
      </div>
    </div>
  );
};
