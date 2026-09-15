"use client";

import React, { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { focusRing, motionState, shape, surface } from "./ui.common";

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
      <div className={cn("flex w-full flex-col", className)}>
        {label && (
          <label htmlFor={textareaId} className="mb-2 text-sm font-medium text-zinc-200">
            {label}
            {required && <span className="ml-1 text-red-300" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={error || undefined}
          className={cn(
            "min-h-28 min-w-64 w-full resize-y px-5 py-4",
            shape.control,
            motionState,
            focusRing,
            error ? surface.controlError : surface.control,
            "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-zinc-700/55",
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
