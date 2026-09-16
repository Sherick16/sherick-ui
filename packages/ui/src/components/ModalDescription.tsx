"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/libs/utils";
import { text } from "./ui.common";

export type ModalDescriptionProps = ComponentPropsWithoutRef<typeof BaseDialog.Description>;

export const ModalDescription = ({ className, ...props }: ModalDescriptionProps) => {
  return (
    <BaseDialog.Description
      className={cn("px-6 pt-2 text-sm leading-7 sm:px-7", text.medium, className)}
      {...props}
    />
  );
};
