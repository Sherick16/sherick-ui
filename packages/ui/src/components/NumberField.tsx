"use client";

import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import React, { forwardRef, type ComponentProps, type Ref } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingWithin,
  material,
  motion,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";

export interface NumberFieldProps
  extends Omit<
    ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "type" | "size"
  > {
  value?: number | null;
  defaultValue?: number;
  onValueChange?: (value: number | null) => void;
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
  /** Styles the field's own container. */
  className?: string;
  inputClassName?: string;
}

/* Base UI names each stepper itself and keeps it out of the tab order, because the input
   already steps from the keyboard. The steppers therefore carry no focus recipe: they are
   never reachable by `:focus-visible`. They hold no fill at rest — they are the field's own
   parts, not controls beside it — and answer hover and press one step louder than a ghost
   control so the interaction still lands. */
const stepperClassName = cn(
  "inline-flex shrink-0 items-center justify-center",
  density.target,
  shape.circle,
  motion.spring,
  tone.text.secondary,
  stateLayer.tonal,
  state.pressCompact,
  state.disabledAttribute
);

/**
 * A number typed or stepped. Base UI owns parsing, stepping, clamping, spinbutton
 * semantics and locale formatting; the surface belongs to the text-field family, and the
 * two steppers are the field's own parts rather than nested `IconButton` components.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
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
            motion.press,
            focusRingWithin,
            material.control,
            !disabled && state.field.hover,
            !disabled && state.field.focusWithin,
            !disabled && state.field.invalid,
            !disabled && state.field.invalidHover,
            !disabled && state.field.invalidFocusWithin,
            disabled ? state.disabled : state.text
          )}
        >
          <BaseNumberField.Decrement className={cn(stepperClassName)}>
            <Minus aria-hidden="true" className={cn("size-4")} />
          </BaseNumberField.Decrement>
          <BaseNumberField.Input
            {...inputProps}
            ref={ref}
            className={cn(
              "min-w-0 flex-1 bg-transparent py-2 text-center text-inherit outline-none",
              motion.spring,
              state.steppedValue,
              disabled ? state.disabledDescendant : state.text,
              inputClassName
            )}
          />
          <BaseNumberField.Increment className={cn(stepperClassName)}>
            <Plus aria-hidden="true" className={cn("size-4")} />
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    );
  }
);

NumberField.displayName = "NumberField";

export default NumberField;
