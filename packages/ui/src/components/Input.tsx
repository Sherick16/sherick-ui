"use client";

import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import React, {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
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

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: ReactNode;
  description?: ReactNode;
  error?: boolean;
  errorMessage?: ReactNode;
  inputClassName?: string;
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange` instead. */
  onChange?: (value: string) => void;
}

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
    onChange,
    ...props
  }, ref) => {
    const handleValueChange = (value: string) => {
      onValueChange?.(value);
      onChange?.(value);
    };

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
            {required && <span className={cn("ml-1 text-sherick-danger")} aria-hidden="true">*</span>}
          </Field.Label>
        )}
        <BaseInput
          {...props}
          render={<input ref={ref} />}
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          onValueChange={handleValueChange}
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

Input.displayName = "Input";

export default Input;
