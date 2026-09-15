"use client";

import React, { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/libs/utils";

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
    onChange,
    ...props
  }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className={cn("flex flex-col w-full", className)}>
        {label && (
          <label htmlFor={textareaId} className="mb-2 font-semibold">
            {label}
            {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={error || undefined}
          className={cn(
            "px-4 py-4 rounded-lg bg-opacity-20 hover:bg-opacity-40 border transition-all min-w-64 min-h-16 w-full border-opacity-20 focus:outline-none focus:border-opacity-50",
            !error
              ? "border-gray-400 bg-gray-400 text-gray-300 hover:bg-gray-500"
              : "border-red-500 border-opacity-40 focus:border-opacity-100 text-red-400 bg-red-500 bg-opacity-10 hover:bg-opacity-20 hover:bg-red-500",
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
