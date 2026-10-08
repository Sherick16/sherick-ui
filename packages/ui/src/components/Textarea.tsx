"use client";

import { Field } from "@base-ui/react/field";
import React, {
  forwardRef,
  type ComponentProps,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/libs/utils";
import {
  density,
  fieldLayout,
  fieldMessage,
  focusRing,
  material,
  rim,
  shape,
  state,
  text,
} from "./ui.common";
import { motionFeedback } from "./ui.motion";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  description?: ReactNode;
  error?: boolean;
  errorMessage?: ReactNode;
  textareaClassName?: string;
  /** Base's value-change callback, event details included. */
  onValueChange?: ComponentProps<typeof Field.Control>["onValueChange"];
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    description,
    className,
    textareaClassName,
    required,
    error = false,
    errorMessage,
    id,
    name,
    disabled,
    onValueChange,
    value,
    defaultValue,
    ...textareaProps
  }, ref) => {
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
        <Field.Control
          render={<textarea {...textareaProps} ref={ref} />}
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          className={(controlState) => {
            /* Invalid by its own prop, or by what Base reports — a failed constraint, or the error a
               `Form` returns for this field's name: one field, one ladder. */
            const invalid = error || controlState.valid === false;
            return cn(
              "min-w-0 w-full resize-y",
              density.normal,
              "min-h-28 px-5 py-4",
              shape.control,
              motionFeedback,
              focusRing,
              invalid ? material.controlError : material.control,
              invalid ? rim.fieldError : rim.field,
              !disabled && (invalid ? state.field.errorHover : state.field.hover),
              !disabled && (invalid ? state.field.errorFocus : state.field.focus),
              disabled ? state.disabled : state.text,
              textareaClassName
            );
          }}
        />
        {description && (
          <Field.Description className={cn(fieldMessage.description)}>
            {description}
          </Field.Description>
        )}
        {/* Mounted whether or not a message was passed, as `Field`'s is: without `match` this part
            renders what Base reports, including the error a `Form` returns for this field's name. */}
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

Textarea.displayName = "Textarea";

export default Textarea;
