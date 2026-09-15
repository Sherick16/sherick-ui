import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export const ModalFooter = ({ children, className }: ModalFooterProps) => {
  return (
    <div
      className={cn(
        "mt-auto flex items-center justify-end gap-3 px-6 pb-6 pt-3",
        className
      )}
    >
      {children}
    </div>
  );
};
