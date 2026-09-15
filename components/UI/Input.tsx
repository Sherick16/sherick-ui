"use client";

import React, { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/libs/utils";

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
          <label htmlFor={inputId} className="mb-2 font-semibold">
            {label}
            {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error || undefined}
          className={cn(
            "px-6 py-4 rounded-4xl bg-opacity-20 hover:bg-opacity-40 border transition-all min-w-64 border-opacity-20 focus:outline-none focus:border-opacity-50",
            !error
              ? "border-gray-400 bg-gray-400 text-gray-300 hover:bg-gray-500"
              : "border-red-500 border-opacity-40 focus:border-opacity-100 text-red-400 bg-red-500 bg-opacity-10 hover:bg-opacity-20 hover:bg-red-500",
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
