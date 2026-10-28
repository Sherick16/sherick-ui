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
  fieldLabel,
  fieldLayout,
  fieldMessage,
  focusRing,
  material,
  rim,
  shape,
  state,
} from "./ui.common";
import { motionFeedback } from "./ui.motion";
import FieldLabel from "./FieldLabel";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  description?: ReactNode;
  /**
   * Marks the field invalid. A message is shown beneath it, so a `ReactNode` here is both the flag and
   * its message. `true` marks the field without one, and `errorMessage` supplies the message.
   */
  error?: ReactNode;
  /** The message for `error={true}`. A message passed as `error` takes its place. */
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
    error,
    errorMessage,
    id,
    name,
    disabled,
    onValueChange,
    value,
    defaultValue,
    ...textareaProps
  }, ref) => {
    /* An `error` that is a message, or a flag with the message beside it: both mark the field invalid. */
    const invalidByProp = Boolean(error);
    const errorText = typeof error === "boolean" || error == null ? errorMessage : error;

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
            const invalid = invalidByProp || controlState.valid === false;
            return cn(
              "min-w-0 w-full resize-y",
              density.normal,
              "min-h-28 px-5 py-4",
              shape.control,
              motionFeedback,
              focusRing,
              invalid ? material.controlError : material.control,
              rim.field,
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

Textarea.displayName = "Textarea";

export default Textarea;
