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
            "px-4 py-4 rounded-lg bg-opacity-20 hover:bg-opacity-40 transition-all min-w-64 min-h-16 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
            !error
              ? "bg-gray-400 text-gray-300 hover:bg-gray-500"
              : "text-red-300 bg-red-500 bg-opacity-15 hover:bg-opacity-25 hover:bg-red-500 focus-visible:ring-red-400/30",
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
