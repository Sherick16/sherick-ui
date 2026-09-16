"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { text } from "./ui.common";

export interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export const ModalContent = ({ children, className }: ModalContentProps) => {
  return (
    <BaseDialog.Description
      render={<div />}
      className={cn("px-6 pt-2 pb-5 text-sm leading-7 sm:px-7", text.medium, className)}
    >
      {children}
    </BaseDialog.Description>
  );
};
