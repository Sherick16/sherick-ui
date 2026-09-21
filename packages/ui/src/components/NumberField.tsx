"use client";

import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import React, { forwardRef, type ComponentProps, type Ref } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingWithin,
  material,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";

export interface NumberFieldProps
  extends Omit<
    ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "type" | "size" | "ref"
  > {
  value?: number | null;
  defaultValue?: number;
  onValueChange?: BaseNumberField.Root.Props["onValueChange"];
  /** Fires when a change is committed — a stepper released, a value blurred into place. */
  onValueCommitted?: BaseNumberField.Root.Props["onValueCommitted"];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Identifies the field when a form is submitted. */
  name?: string;
  form?: string;
  /** A ref to the hidden `<input type="number">` that participates in the form. */
  inputRef?: Ref<HTMLInputElement>;
  /** Styles the field's own container. The text input is styled through `inputClassName`. */
  className?: string;
  inputClassName?: string;
}

/* Base UI names each stepper itself and keeps it out of the tab order, because the input already
   steps from the keyboard. The steppers never take a focus ring: they are not reachable by
   `:focus-visible`. */
const stepperClassName = cn(
  "group inline-flex shrink-0 items-center justify-center",
  density.target,
  shape.circle,
  motionFeedback,
  tone.text.secondary,
  stateLayer.tonal,
  state.effectiveDisabled
);

/* The target stays exactly where the pointer found it — a 44px target that shrank while held would
   move the ground under a pointer that is already near its edge — and the glyph inside it takes the
   press. */
const stepperIconClassName = `inline-flex items-center justify-center ${motionInkPress}`;

/**
 * A number typed or stepped. Base UI owns parsing, stepping, clamping, spinbutton semantics and
 * locale formatting; the ref points at the input, and the hidden form input is `inputRef`.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onValueCommitted,
      min,
      max,
      step,
      disabled,
      readOnly,
      required,
      name,
      form,
      inputRef,
      className,
      inputClassName,
      ...inputProps
    },
    ref
  ) => {
    return (
      <BaseNumberField.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        form={form}
        inputRef={inputRef}
        className={cn("w-full", className)}
      >
        <BaseNumberField.Group
          className={cn(
            "group flex w-full items-center gap-1 p-1.5",
            density.normal,
            shape.control,
            motionFeedback,
            focusRingWithin,
            material.control,
            state.effectiveDisabled,
            state.field.hover,
            state.field.focusWithin,
            state.field.invalid,
            state.field.invalidHover,
            state.field.invalidFocusWithin,
            state.text
          )}
        >
          <BaseNumberField.Decrement className={cn(stepperClassName)}>
            <span className={cn(stepperIconClassName)}>
              <Minus aria-hidden="true" className={cn("size-4")} />
            </span>
          </BaseNumberField.Decrement>
          <BaseNumberField.Input
            {...inputProps}
            ref={ref}
            className={cn(
              "min-w-0 flex-1 bg-transparent py-2 text-center text-inherit outline-none",
              state.text,
              inputClassName
            )}
          />
          <BaseNumberField.Increment className={cn(stepperClassName)}>
            <span className={cn(stepperIconClassName)}>
              <Plus aria-hidden="true" className={cn("size-4")} />
            </span>
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    );
  }
);

NumberField.displayName = "NumberField";

export default NumberField;
