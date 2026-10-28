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
  fieldLabel,
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
import FieldLabel from "./FieldLabel";
import { fieldDensity, type FieldSize } from "./Field";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  /**
   * Marks the field invalid. A message is shown beneath it, so a `ReactNode` here is both the flag and
   * its message. `true` marks the field without one, and `errorMessage` supplies the message.
   */
  error?: ReactNode;
  /** The message for `error={true}`. A message passed as `error` takes its place. */
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
  /**
   * The field's density: `sm` for a dense filter row, `md` (the default) or `lg`. A number is the
   * native `size` attribute of the input, as it always was.
   */
  size?: FieldSize | number;
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
    error,
    errorMessage,
    id,
    name,
    disabled,
    onValueChange,
    prefix,
    suffix,
    size,
    ...props
  }, ref) => {
    /* An `error` that is a message, or a flag with the message beside it: both mark the field invalid. */
    const invalidByProp = Boolean(error);
    const errorText = typeof error === "boolean" || error == null ? errorMessage : error;
    const fieldSize: FieldSize = typeof size === "string" ? size : "md";
    const nativeSize = typeof size === "number" ? size : undefined;
    /* A compact field keeps its 40px height with a 20px line, so its vertical padding steps down with it. */
    const padding = fieldSize === "sm" ? "py-2" : "py-3";

    /* A field marked invalid by its own prop and one that learns it from Base — a failed constraint,
       or an error a `Form` reports for its name — are the same field, so both take the same ladder. */
    const isInvalid = (valid: boolean | null) => invalidByProp || valid === false;

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
        invalid={invalidByProp}
      >
        {label && (
          <Field.Label className={cn(fieldLabel)}>
            <FieldLabel required={required}>{label}</FieldLabel>
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
            size={nativeSize}
            onValueChange={onValueChange}
            className={(inputState) =>
              cn(
                `min-w-0 flex-1 bg-transparent ${padding} [outline-style:none]`,
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
                  fieldDensity[fieldSize],
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
            size={nativeSize}
            onValueChange={onValueChange}
            className={(inputState) => {
              const invalid = isInvalid(inputState.valid);
              return cn(
                fieldDensity[fieldSize],
                `min-w-0 w-full px-5 ${padding}`,
                shape.control,
                motionFeedback,
                focusRing,
                invalid ? material.controlError : material.control,
                rim.field,
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
            invalid with no message of its own shows only its danger tray, so give an invalid
            field a message that says how to recover. */}
        {!(invalidByProp && !errorText) && (
          <Field.Error
            match={invalidByProp ? true : undefined}
            className={cn(fieldMessage.error)}
            {...(invalidByProp ? { children: errorText } : {})}
          />
        )}
      </Field.Root>
    );
  }
);

Input.displayName = "Input";

export default Input;
