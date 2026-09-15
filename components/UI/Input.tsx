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
          <label htmlFor={inputId} className="mb-2 text-sm font-medium text-sherick-ink/[0.88]">
            {label}
            {required && <span className="ml-1 text-sherick-danger" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error || undefined}
          className={cn(
            "min-h-12 min-w-64 px-5 py-3 text-[0.95rem]",
            shape.control,
            motionState,
            focusRing,
            error ? surface.controlError : surface.control,
            "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-sherick-surface-high/[0.78]",
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
