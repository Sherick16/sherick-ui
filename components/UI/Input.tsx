"use client";

import React, { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { focusRing, motionState, shape, surface } from "./ui.common";

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
    onChange,
    ...props
  }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={cn("flex flex-col", className)}>
        {label && (
          <label htmlFor={inputId} className="mb-2 text-sm font-medium text-zinc-200">
            {label}
            {required && <span className="ml-1 text-red-300" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error || undefined}
          className={cn(
            "min-h-12 min-w-64 px-5 py-3",
            shape.control,
            motionState,
            focusRing,
            error ? surface.controlError : surface.control,
            "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-zinc-700/55",
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
