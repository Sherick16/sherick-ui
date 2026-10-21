"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/utils";
import { text, type } from "./ui.common";

export type DialogDescriptionProps = ComponentPropsWithoutRef<typeof BaseDialog.Description>;

export const DialogDescription = ({ className, ...props }: DialogDescriptionProps) => {
  return (
    <BaseDialog.Description
      className={cn("px-6 pt-2 sm:px-7", type.body, text.medium, className)}
      {...props}
    />
  );
};
