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
      {/* Every state of the track and the thumb is keyed on the primitive's own selection
          marker rather than on the `checked` prop, so an uncontrolled switch is styled from
          the same source of truth as a controlled one — and its thumb actually travels. */}
      <span
        aria-hidden="true"
        className={cn(
          "relative block h-8 w-[3.25rem] shrink-0",
          shape.pill,
          elevation.recessed,
          motionFeedback,
          groupFocusRing,
          tone.strong.secondary,
          text.medium,
          tone.strongChecked[variant],
          !disabled && stateLayer.track
        )}
      >
        <BaseSwitch.Thumb
          className={cn(
            "absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 bg-current",
            "group-data-[checked]:h-6 group-data-[checked]:w-6 group-data-[checked]:translate-x-5",
            shape.circle,
            elevation.control,
            motionRelocate
          )}
        />
      </span>
    </BaseSwitch.Root>
  );
});

Switch.displayName = "Switch";
