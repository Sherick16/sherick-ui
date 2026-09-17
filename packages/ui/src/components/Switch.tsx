"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type Ref,
} from "react";
import { cn } from "@/libs/utils";
import {
  elevation,
  groupFocusRing,
  motion,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { Variant } from "./ui.types";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** @deprecated Use `onCheckedChange` instead. */
  onChange?: (checked: boolean) => void;
  variant?: Variant;
  value?: string;
  uncheckedValue?: string;
  readOnly?: boolean;
  required?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({
  checked = false,
  onCheckedChange,
  onChange,
  variant = "primary",
  className,
  disabled,
  name,
  form,
  value,
  uncheckedValue,
  readOnly,
  required,
  inputRef,
  ...buttonProps
}, ref) => {
  return (
    <BaseSwitch.Root
      nativeButton
      render={<button {...buttonProps} ref={ref} type="button" />}
      checked={checked}
      disabled={disabled}
      name={name}
      form={form}
      value={value}
      uncheckedValue={uncheckedValue}
      readOnly={readOnly}
      required={required}
      inputRef={inputRef}
      onCheckedChange={(nextChecked) => {
        onCheckedChange?.(nextChecked);
        onChange?.(nextChecked);
      }}
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
          groupFocusRing,
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
            checked ? "h-6 w-6 translate-x-5" : "h-5 w-5 text-sherick-ink-muted"
          )}
        />
      </span>
    </BaseSwitch.Root>
  );
});

Switch.displayName = "Switch";
