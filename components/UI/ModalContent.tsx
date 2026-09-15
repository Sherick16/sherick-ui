import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";

export interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export const ModalContent = ({ children, className }: ModalContentProps) => {
  return (
    <div id="modal-description" className={cn("px-6 py-4 text-gray-300", className)}>
      {children}
    </div>
  );
};
