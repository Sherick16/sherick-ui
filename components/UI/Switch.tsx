"use client";

import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { focusRing, motionComponent, pressable, toneStrongMap } from "./ui.common";
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
        "relative inline-flex min-h-11 min-w-14 items-center rounded-full p-1.5",
        motionComponent,
        focusRing,
        !disabled && pressable,
        checked ? toneStrongMap[variant] : "bg-zinc-600/50 text-zinc-100",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "block h-5 w-5 rounded-full bg-current shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
};
