"use client";

import { Field } from "@base-ui/react/field";
import React, { forwardRef, type TextareaHTMLAttributes } from "react";
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
  label?: string;
  error?: boolean;
  textareaClassName?: string;
  onChange?: (value: string) => void;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    className,
    textareaClassName,
    required,
    error = false,
    id,
    name,
    disabled,
    onChange,
    ...props
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
            {required && <span className="ml-1 text-sherick-danger" aria-hidden="true">*</span>}
          </Field.Label>
        )}
        <Field.Control
          {...props}
          render={<textarea ref={ref} />}
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          onValueChange={(value) => onChange?.(String(value))}
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
      </Field.Root>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
