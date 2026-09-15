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
  toneStrongMap,
  toneSurfaceMap,
  toneTextMap,
} from "./ui.common";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

export type ButtonAppearance = "filled" | "tonal" | "text";
export type ButtonSize = "sm" | "md" | "lg";

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

const sizeMap: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-12 px-6 py-3",
  lg: "min-h-14 px-8 py-4 text-lg font-medium",
};

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({
    children,
    variant = "primary",
    appearance = "tonal",
    size = "md",
    icon,
    className,
    loading = false,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        {...props}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium",
          shape.pill,
          sizeMap[size],
          motionState,
          focusRing,
          !isDisabled && pressable,
          appearance === "filled" && toneStrongMap[variant],
          appearance === "tonal" && toneSurfaceMap[variant],
          appearance === "tonal" && toneTextMap[variant],
          appearance !== "text" && !isDisabled && toneHoverMap[variant],
          appearance !== "text" && !isDisabled && toneActiveMap[variant],
          appearance === "text" && toneTextMap[variant],
          appearance === "text" && !isDisabled && "hover:bg-white/5 active:bg-white/10",
          isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
          className
        )}
      >
        {loading ? (
          <Spinner size="small" />
        ) : icon ? (
          <span className="inline-flex shrink-0 items-center" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span>{children}</span>
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
