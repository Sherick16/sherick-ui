"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import {
  elevation,
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
  type: _type,
  ...props
}: SwitchProps) => {
  return (
    <BaseSwitch.Root
      {...props}
      nativeButton
      render={<button type="button" />}
      checked={checked}
      disabled={disabled}
      onCheckedChange={(nextChecked) => onChange?.(nextChecked)}
      className={cn(
        "group inline-flex min-h-12 min-w-14 items-center justify-center rounded-full outline-none",
        disabled ? state.disabled : state.enabled,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative block h-8 w-[3.25rem] shrink-0",
          shape.pill,
          elevation.recessed,
          motion.release,
          "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-sherick-focus group-focus-visible:outline-offset-[3px]",
          checked ? tone.strong[variant] : cn(tone.strong.secondary, text.medium),
          !disabled && stateLayer.track,
          !disabled && state.groupPress
        )}
      >
        <BaseSwitch.Thumb
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
    </BaseSwitch.Root>
  );
};
