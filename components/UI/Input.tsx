"use client";

import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import React, { forwardRef, type InputHTMLAttributes } from "react";
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

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    className,
    inputClassName,
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
        className={cn("flex flex-col", className)}
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
        <BaseInput
          {...props}
          render={<input ref={ref} />}
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          onValueChange={(value) => onChange?.(value)}
          className={cn(
            density.normal,
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
        />
      </Field.Root>
    );
  }
);

Input.displayName = "Input";

export default Input;
