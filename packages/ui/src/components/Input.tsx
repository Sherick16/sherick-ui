"use client";

import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import React, {
  forwardRef,
  type InputHTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import {
  density,
  fieldLayout,
  fieldMessage,
  focusRing,
  focusRingWithin,
  material,
  rim,
  shape,
  state,
  text,
} from "./ui.common";
import { motionFeedback } from "./ui.motion";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: ReactNode;
  description?: ReactNode;
  error?: boolean;
  errorMessage?: ReactNode;
  inputClassName?: string;
  /** Base's value-change callback, event details included. */
  onValueChange?: BaseInput.Props["onValueChange"];
  /**
   * Text or a mark at the start of the field, such as `€` or `https://`. It is presentation only and
   * hidden from assistive technology, so the label must carry whatever the reader needs from it.
   */
  prefix?: ReactNode;
  /** Text or a mark at the end of the field, such as `tickets` or `.discord.gg`. Presentation only. */
  suffix?: ReactNode;
}

/* An affix is supporting copy on the value's own line: quieter than the value, never smaller. */
const affixClassName = cn("shrink-0 select-none whitespace-nowrap", text.medium);

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    description,
    className,
    inputClassName,
    required,
    error = false,
    errorMessage,
    id,
    name,
    disabled,
    onValueChange,
    prefix,
    suffix,
    ...props
  }, ref) => {
    /* A field marked invalid by its own prop and one that learns it from Base — a failed constraint,
       or an error a `Form` reports for its name — are the same field, so both take the same ladder. */
    const isInvalid = (valid: boolean | null) => error || valid === false;

    /* With an affix, the input is the borderless part of a composite field: the box, its rim and its
       focus ring belong to the row that holds the affixes, exactly as a Combobox's do. A press on an
       affix or on the space around it places the caret in the input, the way a press on a label does. */
    const focusInput = (event: PointerEvent<HTMLDivElement>) => {
      const input = event.currentTarget.querySelector("input");
      if (!input || event.target === input || input.disabled) return;
      event.preventDefault();
      input.focus();
    };

    return (
      <Field.Root
        className={cn(fieldLayout, className)}
        name={name}
        disabled={disabled}
        invalid={error}
      >
        {label && (
          <Field.Label className={cn("mb-2 text-sm font-medium", text.high)}>
            {label}
            {required && <span className={cn("ms-1 text-sherick-danger")} aria-hidden="true">*</span>}
          </Field.Label>
        )}
        {prefix != null || suffix != null ? (
          <BaseInput
            {...props}
            ref={ref}
            id={id}
            name={name}
            required={required}
            disabled={disabled}
            onValueChange={onValueChange}
            className={(inputState) =>
              cn(
                "min-w-0 flex-1 bg-transparent py-3 outline-none",
                isInvalid(inputState.valid) ? "placeholder:text-sherick-danger" : "placeholder:text-sherick-ink-muted",
                disabled ? state.disabledDescendant : state.text,
                inputClassName
              )
            }
            render={(inputProps, inputState) => (
              <div
                data-invalid={isInvalid(inputState.valid) ? "" : undefined}
                onPointerDown={focusInput}
                className={cn(
                  "group/field flex min-w-0 w-full items-center gap-2 px-5",
                  density.normal,
                  shape.control,
                  motionFeedback,
                  focusRingWithin,
                  material.control,
                  rim.field,
                  state.field.invalid,
                  !disabled && state.field.hover,
                  !disabled && state.field.focusWithin,
                  !disabled && state.field.invalidHover,
                  !disabled && state.field.invalidFocusWithin,
                  disabled ? state.disabled : state.text
                )}
              >
                {prefix != null && <span aria-hidden="true" className={cn(affixClassName)}>{prefix}</span>}
                <input {...inputProps} />
                {suffix != null && <span aria-hidden="true" className={cn(affixClassName)}>{suffix}</span>}
              </div>
            )}
          />
        ) : (
          <BaseInput
            {...props}
            render={<input ref={ref} />}
            id={id}
            name={name}
            required={required}
            disabled={disabled}
            onValueChange={onValueChange}
            className={(inputState) => {
              const invalid = isInvalid(inputState.valid);
              return cn(
                density.normal,
                "min-w-0 w-full px-5 py-3",
                shape.control,
                motionFeedback,
                focusRing,
                invalid ? material.controlError : material.control,
                invalid ? rim.fieldError : rim.field,
                !disabled && (invalid ? state.field.errorHover : state.field.hover),
                !disabled && (invalid ? state.field.errorFocus : state.field.focus),
                disabled ? state.disabled : state.text,
                inputClassName
              );
            }}
          />
        )}
        {description && (
          <Field.Description className={cn(fieldMessage.description)}>
            {description}
          </Field.Description>
        )}
        {/* Mounted whether or not a message was passed, as `Field`'s is: without `match` this part
            renders what Base reports — a failed constraint, or the error a `Form` returns for this
            field's name — and `match` pins the caller's own message in its place. A field marked
            invalid with no message of its own shows only its rim, as it always has. */}
        {!(error && !errorMessage) && (
          <Field.Error
            match={error ? true : undefined}
            className={cn(fieldMessage.error)}
            {...(error ? { children: errorMessage } : {})}
          />
        )}
      </Field.Root>
    );
  }
);

Input.displayName = "Input";

export default Input;
