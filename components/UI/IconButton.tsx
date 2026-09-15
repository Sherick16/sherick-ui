"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  focusRing,
  motionState,
  pressable,
  shape,
  toneActiveMap,
  toneHoverMap,
  toneSurfaceMap,
  toneTextMap,
} from "./ui.common";
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
          "inline-flex min-h-11 min-w-11 items-center justify-center p-2.5",
          shape.circle,
          motionState,
          focusRing,
          toneSurfaceMap[variant],
          toneTextMap[variant],
          !isDisabled && toneHoverMap[variant],
          !isDisabled && toneActiveMap[variant],
          !isDisabled && pressable,
          isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
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
