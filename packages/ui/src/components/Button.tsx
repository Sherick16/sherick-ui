"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRing,
  iconSlot,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";
import { motionTactile } from "./ui.motion";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

export type ButtonAppearance = "filled" | "tonal" | "text";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

/* The mark follows the type step beside it (§10): a compact label takes the compact slot. */
const slotMap: Record<ButtonSize, string> = {
  sm: iconSlot.compact,
  md: iconSlot.normal,
  lg: iconSlot.prominent,
};

const sizeMap: Record<ButtonSize, string> = {
  sm: `${density.compact} px-4 py-2`,
  md: `${density.normal} px-6 py-3`,
  lg: `${density.prominent} px-8 py-4`,
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
    /* The action ladder: text sits flat, tonal and filled are raised and recess while held. The
       priority action is never flatter than the one beside it. */
    const isRaised = appearance !== "text";
    const isTactile = isRaised && !isDisabled;

    return (
      <BaseButton
        {...props}
        render={<button ref={ref} />}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "relative inline-flex min-w-0 max-w-full items-center justify-center gap-2 font-medium tracking-[-0.01em]",
          shape.pill,
          sizeMap[size],
          motionTactile,
          focusRing,
          appearance === "filled" && tone.strong[variant],
          appearance === "filled" && !isDisabled && stateLayer.filled,
          appearance === "tonal" && tone.tonal[variant],
          appearance === "tonal" && tone.text[variant],
          appearance === "tonal" && !isDisabled && (variant === "secondary" ? stateLayer.tonalNeutral : stateLayer.tonal),
          appearance === "text" && tone.text[variant],
          appearance === "text" && !isDisabled && stateLayer.quiet,
          isRaised && elevation.raised,
          isTactile && state.recess,
          isDisabled ? state.disabled : state.enabled,
          className
        )}
      >
        {/* A mark occupies one slot whatever is inside it. The slot is a fixed box sized by the
            button's type step, so a nested node — a wrapped mark, a status dot — cannot change the
            control's width, and the loading mark lands in the box the icon had. `[&>svg]` normalizes
            direct SVG artwork; sizing nested artwork is the caller's business, as §17 says. */}
        {loading ? (
          <span className={cn(slotMap[size], !icon && "absolute")}>
            <Spinner size="small" className={cn("size-full")} />
          </span>
        ) : icon ? (
          <span className={cn(slotMap[size])} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {/* Retain one label subtree and its accessible name while the spinner occupies its footprint. */}
        <span className={cn("min-w-0 [overflow-wrap:anywhere]", loading && !icon && "opacity-0")}>{children}</span>
      </BaseButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
