"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
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
    const isAcrylic = appearance === "acrylic";

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
          /* Tonal and acrylic share one interaction language: only the material behind
             the button changes, so both take the same state layer. */
          (isTonal || isAcrylic) && !isDisabled && stateLayer.tonal,
          appearance === "ghost" && "bg-transparent",
          appearance === "ghost" && !isDisabled && stateLayer.quiet,
          /* Tactile pair for a matte control; the acrylic button floats instead. */
          isTonal && !isDisabled && elevation.raised,
          isTonal && !isDisabled && state.recess,
          isAcrylic && material.acrylicDense,
          isAcrylic && elevation.floating,
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
