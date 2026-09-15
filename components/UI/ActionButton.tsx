"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRing,
  motion,
  shape,
  state,
  stateLayer,
  tone,
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

/* Density owns height and type; the button's anatomy owns its padding, because a
   button is gripped at its ends and a field is not. */
const sizeMap: Record<ButtonSize, string> = {
  sm: `${density.compact} px-4 py-2`,
  md: `${density.normal} px-6 py-3`,
  lg: `${density.prominent} px-8 py-4`,
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
    /* A tonal button is matte and tactile: it rests a hair above its own track and
       presses back into it. No rim — a filled control is separated by tone and by
       that lift, and an outline would only draw a border around it. */
    const isTactile = appearance === "tonal" && !isDisabled;

    return (
      <button
        ref={ref}
        {...props}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em]",
          shape.pill,
          sizeMap[size],
          motion.release,
          focusRing,
          appearance === "filled" && tone.strong[variant],
          appearance === "filled" && !isDisabled && stateLayer.filled,
          appearance === "tonal" && tone.tonal[variant],
          appearance === "tonal" && tone.text[variant],
          appearance === "tonal" && !isDisabled && stateLayer.tonal,
          appearance === "text" && tone.text[variant],
          appearance === "text" && !isDisabled && stateLayer.quiet,
          isTactile && elevation.raised,
          isTactile && state.recess,
          !isDisabled && state.press,
          isDisabled ? state.disabled : state.enabled,
          className
        )}
      >
        {loading ? (
          <Spinner size="small" />
        ) : icon ? (
          <span className="inline-flex shrink-0 items-center [&>svg]:size-5" aria-hidden="true">
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
