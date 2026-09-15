"use client";

import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { bgMap } from "./ui.common";
import { Variant } from "./ui.types";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  variant?: Variant;
}

export const Switch = ({
  checked = false,
  onChange,
  variant = "primary",
  className,
  disabled,
  ...props
}: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        checked ? bgMap[variant] : "bg-gray-500 bg-opacity-20",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
};
