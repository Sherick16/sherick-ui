"use client";

import React, { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/libs/utils";
import { styleMap } from "./ui.common";
import { Variant } from "./ui.types";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  options: DropdownOption[];
  variant?: Variant;
  onSelect?: (value: string) => void;
  selected?: string;
}

const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({
    options,
    variant = "secondary",
    onSelect,
    selected,
    className,
    disabled,
    ...props
  }, ref) => {
    return (
      <div className={cn("relative inline-block min-w-64", className)}>
        <select
          ref={ref}
          value={selected ?? ""}
          disabled={disabled}
          onChange={(event) => onSelect?.(event.target.value)}
          className={cn(
            "w-full appearance-none px-6 py-4 pr-12 rounded-4xl bg-opacity-20 hover:bg-opacity-40 border transition-all border-opacity-20 focus:outline-none focus:border-opacity-50",
            styleMap[variant] || styleMap.primary,
            disabled && "cursor-not-allowed opacity-60"
          )}
          {...props}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2"
        />
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";

export default Dropdown;
