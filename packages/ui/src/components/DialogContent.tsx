"use client";

import React, { type HTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { text, type } from "./ui.common";

export type DialogContentProps = HTMLAttributes<HTMLDivElement>;

export const DialogContent = ({ children, className, ...props }: DialogContentProps) => {
  return (
    <div
      className={cn("px-6 pt-2 pb-5 sm:px-7", type.body, text.medium, className)}
      {...props}
    >
      {children}
    </div>
  );
};
