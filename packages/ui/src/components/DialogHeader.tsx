"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { text, type } from "./ui.common";

export interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return (
    <div className={cn("pt-5 pb-2 ps-6 pe-16 sm:ps-7", className)}>
      <BaseDialog.Title className={cn("m-0", type.heading, text.high)}>
        {children}
      </BaseDialog.Title>
    </div>
  );
};
