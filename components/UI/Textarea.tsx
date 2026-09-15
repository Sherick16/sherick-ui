"use client";

import React, { forwardRef, useId, type TextareaHTMLAttributes } from "react";
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
    disabled,
    onChange,
    ...props
  }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className={cn("flex w-full flex-col", className)}>
        {label && (
          <label htmlFor={textareaId} className={cn("mb-2 text-sm font-medium", text.high)}>
            {label}
            {required && <span className="ml-1 text-sherick-danger" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cn(
            "w-full resize-y",
            /* Density owns the type step and the control floor; the anatomy sets how
               tall the field actually is. Order matters: the later utility wins. */
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
          onChange={(event) => onChange?.(event.target.value)}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
