"use client";

import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import {
  elevation,
  material,
  motion,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
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
        disabled ? state.disabled : state.enabled,
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          /* The track is a groove in the surface it sits on, so it takes the recessed
             step; the thumb is a matte control resting above it. Same physical model as
             the segmented control. */
          "relative block h-8 w-[3.25rem] shrink-0",
          shape.pill,
          elevation.pressed,
          motion.release,
          "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-sherick-focus group-focus-visible:outline-offset-[3px]",
          checked ? tone.strong[variant] : cn(material.matteHigh, text.medium),
          !disabled && stateLayer.track,
          !disabled && state.groupPress
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 bg-current",
            shape.circle,
            elevation.control,
            motion.release,
            checked
              ? "h-6 w-6 translate-x-5 text-sherick-on-primary"
              : "h-5 w-5 text-sherick-ink-muted"
          )}
        />
      </span>
    </button>
  );
};
