"use client";

import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import React, { forwardRef, type ComponentProps, type PointerEvent, type ReactNode, type Ref } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingWithin,
  material,
  rim,
  shape,
  state,
  stateLayer,
  text,
  tone,
  type,
} from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";

export interface NumberFieldProps
  extends Omit<
    ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "type" | "size" | "ref" | "prefix"
  > {
  value?: number | null;
  defaultValue?: number;
  onValueChange?: BaseNumberField.Root.Props["onValueChange"];
  /** Fires when a change is committed — a stepper released, a value blurred into place. */
  onValueCommitted?: BaseNumberField.Root.Props["onValueCommitted"];
  min?: number;
  max?: number;
  step?: number;
  /**
   * How the value is written: Base's `Intl.NumberFormatOptions`, passed through unchanged —
   * `{ style: "currency", currency: "EUR" }`, `{ minimumFractionDigits: 2 }`, `{ style: "percent" }`.
   */
  format?: BaseNumberField.Root.Props["format"];
  /** The locale the value is parsed and written in. Defaults to the runtime's own. */
  locale?: BaseNumberField.Root.Props["locale"];
  /**
   * A unit written before the value, such as `€`. It is presentation only and hidden from assistive
   * technology, so the field's label must name the unit as well ("Price (€)").
   */
  prefix?: ReactNode;
  /**
   * A unit written after the value, such as `×` or `tickets`. Presentation only, like `prefix`:
   * name the unit in the label as well.
   */
  suffix?: ReactNode;
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
  stateLayer.quiet,
  state.enabled,
  state.disabledPart
);

/* The target stays exactly where the pointer found it — a 44px target that shrank while held would
   move the ground under a pointer that is already near its edge — and the glyph inside it takes the
   press. */
const stepperIconClassName = `inline-flex items-center justify-center ${motionInkPress}`;

/* A unit beside the value is supporting copy at the value's own size, so `15 ×` reads as one
   figure: the unit is quieter than the number it qualifies, never smaller than it. */
const affixClassName = cn("shrink-0 select-none whitespace-nowrap", text.medium);

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
      format,
      locale,
      prefix,
      suffix,
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
    const hasAffix = prefix != null || suffix != null;

    /* The band around a sized value is not part of the input, so a press on a unit or on the space
       beside it would otherwise land on nothing. It is handed to the input the way a press on a
       label is, and a press on the input itself is left alone. */
    const focusValue = (event: PointerEvent<HTMLDivElement>) => {
      const valueInput = event.currentTarget.querySelector("input");
      if (!valueInput || event.target === valueInput || valueInput.disabled) return;
      event.preventDefault();
      valueInput.focus();
    };

    return (
      <BaseNumberField.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
        min={min}
        max={max}
        step={step}
        format={format}
        locale={locale}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        form={form}
        inputRef={inputRef}
        className={cn("min-w-0 w-full", className)}
      >
        <BaseNumberField.Group
          className={({ disabled: fieldDisabled }) => cn(
            // The 44px targets fit the normal 48px field, inside its rim, without inflating its density.
            "group/field flex w-full items-center gap-1 px-1.5",
            density.normal,
            shape.control,
            motionFeedback,
            focusRingWithin,
            material.control,
            rim.field,
            state.field.invalid,
            !fieldDisabled && state.field.hover,
            !fieldDisabled && state.field.focusWithin,
            !fieldDisabled && state.field.invalidHover,
            !fieldDisabled && state.field.invalidFocusWithin,
            fieldDisabled ? state.disabled : state.text
          )}
        >
          <BaseNumberField.Decrement className={cn(stepperClassName)}>
            <span className={cn(stepperIconClassName)}>
              <Minus aria-hidden="true" className={cn("size-5")} />
            </span>
          </BaseNumberField.Decrement>
          {hasAffix ? (
            /* The value and its units are one centred figure, so the input is exactly as wide as the
               text it holds: a hidden copy of that text sizes the cell both share, and the units sit
               against it on either side. The rest of the band still belongs to the input — a press
               anywhere in it, units included, places the caret in the value. */
            <div
              className={cn("flex min-w-0 flex-1 cursor-text items-center justify-center gap-1.5 self-stretch")}
              onPointerDown={focusValue}
            >
              {prefix != null && <span aria-hidden="true" className={cn(affixClassName)}>{prefix}</span>}
              <BaseNumberField.Input
                {...inputProps}
                ref={ref}
                className={cn(
                  "absolute inset-0 min-w-0 w-full bg-transparent py-2 text-center text-inherit outline-none",
                  type.numeric,
                  state.text,
                  inputClassName
                )}
                render={(props) => (
                  /* The input lies over its own sizer rather than beside it: a text input keeps an
                     intrinsic width of several characters however small its `size`, and only the
                     text should decide how wide the value is. */
                  <span className={cn("relative inline-block min-w-[1ch] max-w-full")}>
                    <span
                      aria-hidden="true"
                      className={cn("invisible block overflow-hidden whitespace-pre py-2", type.numeric)}
                    >
                      {String(props.value ?? "") || props.placeholder || " "}
                    </span>
                    <input {...props} size={1} />
                  </span>
                )}
              />
              {suffix != null && <span aria-hidden="true" className={cn(affixClassName)}>{suffix}</span>}
            </div>
          ) : (
            <BaseNumberField.Input
              {...inputProps}
              ref={ref}
              className={cn(
                "min-w-0 flex-1 bg-transparent py-2 text-center text-inherit outline-none",
                type.numeric,
                state.text,
                inputClassName
              )}
            />
          )}
          <BaseNumberField.Increment className={cn(stepperClassName)}>
            <span className={cn(stepperIconClassName)}>
              <Plus aria-hidden="true" className={cn("size-5")} />
            </span>
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    );
  }
);

NumberField.displayName = "NumberField";

export default NumberField;
