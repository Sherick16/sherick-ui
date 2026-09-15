"use client";

import React, { forwardRef, useId, type InputHTMLAttributes } from "react";
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

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: boolean;
  inputClassName?: string;
  onChange?: (value: string) => void;
}

/* A field is flat matte and borderless: it rests on its surface-high fill and steps
   that fill up on hover and focus. No ring, no lift — a border that appears on focus
   is still a border, and the keyboard ring belongs outside the shape. */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    className,
    inputClassName,
    required,
    error = false,
    id,
    disabled,
    onChange,
    ...props
  }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={cn("flex flex-col", className)}>
        {label && (
          <label htmlFor={inputId} className={cn("mb-2 text-sm font-medium", text.high)}>
            {label}
            {required && <span className="ml-1 text-sherick-danger" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cn(
            density.normal,
            /* Density owns the type step and the control floor; the anatomy sets the
               padding a field holds its text in. */
            "min-w-64 px-5 py-3",
            shape.control,
            motion.press,
            focusRing,
            error ? material.controlError : material.control,
            !disabled && (error ? state.field.errorHover : state.field.hover),
            !disabled && (error ? state.field.errorFocus : state.field.focus),
            disabled ? state.disabled : state.text,
            inputClassName
          )}
          onChange={(event) => onChange?.(event.target.value)}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
