"use client";

import { Field } from "@base-ui/react/field";
import React, {
  forwardRef,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRing,
  material,
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
  onValueChange?: (value: string) => void;
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
        className={cn("flex w-full flex-col", className)}
        name={name}
        disabled={disabled}
        invalid={error}
      >
        {label && (
          <Field.Label className={cn("mb-2 text-sm font-medium", text.high)}>
            {label}
            {required && <span className={cn("ml-1 text-sherick-danger")} aria-hidden="true">*</span>}
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
          className={cn(
            "w-full resize-y",
            density.normal,
            "min-h-28 px-5 py-4",
            shape.control,
            motionFeedback,
            focusRing,
            error ? material.controlError : material.control,
            !disabled && (error ? state.field.errorHover : state.field.hover),
            !disabled && (error ? state.field.errorFocus : state.field.focus),
            disabled ? state.disabled : state.text,
            textareaClassName
          )}
        />
        {description && (
          <Field.Description className={cn("mt-2 text-xs leading-5", text.medium)}>
            {description}
          </Field.Description>
        )}
        {errorMessage && (
          <Field.Error
            match={error}
            className={cn("mt-2 text-xs leading-5 text-sherick-danger")}
          >
            {errorMessage}
          </Field.Error>
        )}
      </Field.Root>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
