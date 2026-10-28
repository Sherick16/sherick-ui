"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import React, {
  forwardRef,
  useRef,
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
import { useControlNameWarning } from "./Field";
import { Variant } from "./ui.types";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Base's checked-change callback, event details included. */
  onCheckedChange?: BaseSwitch.Root.Props["onCheckedChange"];
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
  /* The visible button is both the forwarded ref and the element the name check reads. */
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const setButtonRef = (node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  useControlNameWarning(buttonRef, "Switch", Boolean(buttonProps["aria-label"] || buttonProps["aria-labelledby"]));

  return (
    <BaseSwitch.Root
      nativeButton
      render={<button {...buttonProps} ref={setButtonRef} type="button" />}
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
        "group inline-flex min-h-12 min-w-14 items-center justify-center [outline-style:none]",
        shape.pill,
        state.enabled,
        state.effectiveDisabled,
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
          stateLayer.track,
          /* Forced colors removes the track's fill and its shadow, so the track keeps its boundary as a
             border the browser repaints. In normal colors the track still has no rim: its thumb and its
             range identify it. */
          "forced-colors:border"
        )}
      >
        <BaseSwitch.Thumb
          className={cn(
            "absolute start-1 top-1/2 h-5 w-5 -translate-y-1/2 bg-current",
            "group-data-[checked]:h-6 group-data-[checked]:w-6 group-data-[checked]:translate-x-5 rtl:group-data-[checked]:-translate-x-5",
            shape.circle,
            elevation.control,
            motionRelocate,
            /* The thumb's fill is a background, and forced colors removes every background unless the part
               opts out of colour adjustment, so the thumb opts out and paints a system colour in both
               states. Its position still says on or off. */
            "forced-color-adjust-none forced-colors:[background-color:Highlight]"
          )}
        />
      </span>
    </BaseSwitch.Root>
  );
});

Switch.displayName = "Switch";
