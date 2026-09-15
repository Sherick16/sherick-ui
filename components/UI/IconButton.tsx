"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { focusRing, styleMap } from "./ui.common";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  loading?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "primary", icon, className, loading = false, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        {...props}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "p-2 rounded-2xl bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center",
          focusRing,
          styleMap[variant] || styleMap.primary,
          isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className
        )}
      >
        {loading ? <Spinner size="small" /> : icon ?? null}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
