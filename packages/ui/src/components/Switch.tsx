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
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { motionFeedback, motionRelocate } from "./ui.motion";
import { Variant } from "./ui.types";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: Variant;
  value?: string;
  uncheckedValue?: string;
  readOnly?: boolean;
  required?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({
  checked,
  defaultChecked,
  onCheckedChange,
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
      defaultChecked={defaultChecked}
      disabled={disabled}
      name={name}
      form={form}
      value={value}
      uncheckedValue={uncheckedValue}
      readOnly={readOnly}
      required={required}
      inputRef={inputRef}
      onCheckedChange={onCheckedChange}
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
          motionFeedback,
          groupFocusRing,
          checked ? tone.strong[variant] : cn(tone.strong.secondary, text.medium),
          !disabled && stateLayer.track
        )}
      >
        <BaseSwitch.Thumb
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 bg-current",
            shape.circle,
            elevation.control,
            motionRelocate,
            checked ? "h-6 w-6 translate-x-5" : "h-5 w-5 text-sherick-ink-muted"
          )}
        />
      </span>
    </BaseSwitch.Root>
  );
});

Switch.displayName = "Switch";
