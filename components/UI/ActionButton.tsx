"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  edge,
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

/* Size is density: the same three control steps every other control in the library
   uses, so a button and a field of the same density line up. */
const sizeMap: Record<ButtonSize, string> = {
  sm: density.compact,
  md: density.normal,
  lg: density.prominent,
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
    /* A tonal button is a raised matte control: it carries the tactile pair, and it
       presses into its own track while held. Filled buttons stay flat — their fill
       already marks them as priority, and a second depth cue would fight it. */
    const isRaised = appearance === "tonal" && !isDisabled;

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
          isRaised && edge.faint,
          isRaised && elevation.raised,
          isRaised && state.recess,
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
