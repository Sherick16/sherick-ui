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
  motion,
  shape,
  state,
  text,
} from "./ui.common";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: ReactNode;
  description?: ReactNode;
  error?: boolean;
  errorMessage?: ReactNode;
  textareaClassName?: string;
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange` instead. */
  onChange?: (value: string) => void;
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
    onChange,
    value,
    defaultValue,
    ...textareaProps
  }, ref) => {
    const handleValueChange = (nextValue: unknown) => {
      const normalized = String(nextValue);
      onValueChange?.(normalized);
      onChange?.(normalized);
    };

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
            {required && <span className="ml-1 text-sherick-danger" aria-hidden="true">*</span>}
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
          onValueChange={handleValueChange}
          className={cn(
            "w-full resize-y",
            density.normal,
            "min-h-28 min-w-64 px-5 py-4",
            shape.control,
            motion.press,
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
            className="mt-2 text-xs leading-5 text-sherick-danger"
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
