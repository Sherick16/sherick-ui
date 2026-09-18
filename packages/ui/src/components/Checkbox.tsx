"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check as CheckIcon, Minus } from "lucide-react";
import React, { forwardRef, type ButtonHTMLAttributes, type Ref } from "react";
import { cn } from "@/libs/utils";
import { groupFocusRing, hitArea, selectable, shape, state, stateLayer } from "./ui.common";
import { motionArrive } from "./ui.motion";

export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "type"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: BaseCheckbox.Root.Props["onCheckedChange"];
  /** Neither ticked nor unticked. Base UI reports it as `mixed`, not as a ticked box. */
  indeterminate?: boolean;
  value?: string;
  /** The value submitted when the box is unticked. By default a form omits it, as native. */
  uncheckedValue?: string;
  readOnly?: boolean;
  required?: boolean;
  /** A ref to the hidden `<input>` that participates in the form. */
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * A ticked, unticked or mixed choice. The ref points at the visible button; the form input Base
 * UI keeps beside it is reached through `inputRef`.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      onCheckedChange,
      indeterminate = false,
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
    },
    ref
  ) => {
    return (
      <BaseCheckbox.Root
        nativeButton
        render={<button {...buttonProps} ref={ref} type="button" />}
        checked={checked}
        defaultChecked={defaultChecked}
        indeterminate={indeterminate}
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
          // `align-middle` rather than the default baseline: an inline-level box whose baseline comes
          // from its own children shifts the moment its mark appears or leaves, which is exactly what
          // a checkbox does.
          "group inline-flex w-fit align-middle",
          hitArea,
          state.enabled,
          state.effectiveDisabled,
          className
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-6 shrink-0 items-center justify-center",
            shape.mark,
            selectable.surface,
            selectable.rest,
            selectable.selected,
            selectable.indeterminate,
            stateLayer.track,
            groupFocusRing
          )}
        >
          <BaseCheckbox.Indicator className={cn("flex items-center justify-center", motionArrive)}>
            {indeterminate ? (
              <Minus className={cn("size-4")} />
            ) : (
              <CheckIcon className={cn("size-4")} />
            )}
          </BaseCheckbox.Indicator>
        </span>
      </BaseCheckbox.Root>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
