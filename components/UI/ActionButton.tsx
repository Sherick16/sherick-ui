"use client";

import { Button } from "@base-ui/react/button";
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
    type = "button",
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const isTactile = appearance === "tonal" && !isDisabled;

    return (
      <Button
        {...props}
        render={<button ref={ref} />}
        type={type}
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
      </Button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
