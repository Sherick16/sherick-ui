import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { text } from "./ui.common";

export interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export const ModalContent = ({ children, className }: ModalContentProps) => {
  return (
    <div
      id="modal-description"
      className={cn("px-6 py-3 text-sm leading-7 sm:px-7", text.medium, className)}
    >
      {children}
    </div>
  );
};
