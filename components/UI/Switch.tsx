"use client";

import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { elevation, motionComponent, stateLayer, toneStrongMap } from "./ui.common";
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
        "group inline-flex min-h-12 min-w-14 items-center justify-center rounded-full outline-none",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative block h-8 w-[3.25rem] shrink-0 rounded-full shadow-inner",
          motionComponent,
          "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-sherick-focus group-focus-visible:outline-offset-[3px]",
          checked ? toneStrongMap[variant] : "bg-sherick-surface-high text-sherick-ink-muted",
          disabled && checked && "bg-sherick-primary-soft/[0.55] text-sherick-ink-muted saturate-50",
          disabled && !checked && "bg-sherick-surface-high/[0.62] text-sherick-ink-muted/70",
          !disabled && stateLayer.switchTrack,
          !disabled && "group-active:scale-[0.985]",
          "motion-reduce:group-active:scale-100"
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-current",
            elevation.control,
            "transition-[width,height,transform,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            checked
              ? "h-6 w-6 translate-x-5 text-sherick-on-primary"
              : "h-5 w-5 translate-x-0 text-sherick-ink-muted",
            disabled && "text-sherick-ink-muted/80"
          )}
        />
      </span>
    </button>
  );
};
