"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  edge,
  elevation,
  focusRing,
  material,
  motion,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

export type IconButtonAppearance = "tonal" | "ghost" | "acrylic";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  appearance?: IconButtonAppearance;
  icon?: ReactNode;
  loading?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    variant = "primary",
    appearance = "tonal",
    icon,
    className,
    loading = false,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const isTonal = appearance === "tonal";

    return (
      <button
        ref={ref}
        {...props}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center p-2.5 [&>svg]:size-5",
          density.target,
          shape.circle,
          motion.release,
          focusRing,
          tone.text[variant],
          isTonal && tone.tonal[variant],
          isTonal && !isDisabled && edge.faint,
          isTonal && !isDisabled && elevation.raised,
          isTonal && !isDisabled && state.recess,
          appearance === "ghost" && "bg-transparent",
          /* Acrylic and tonal share one interaction language: the material behind the
             button changes, the way it responds does not. */
          (isTonal || appearance === "acrylic") && !isDisabled && stateLayer.tonal,
          appearance === "ghost" && !isDisabled && stateLayer.quiet,
          appearance === "acrylic" && material.acrylicDense,
          !isDisabled && state.press,
          isDisabled ? state.disabled : state.enabled,
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
