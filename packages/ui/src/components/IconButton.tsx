"use client";

import { Button } from "@base-ui/react/button";
import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRing,
  material,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";
import { motionTactile } from "./ui.motion";
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
    type = "button",
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const isTonal = appearance === "tonal";
    const isAcrylic = appearance === "acrylic";

    return (
      <Button
        {...props}
        render={<button ref={ref} />}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center p-2.5 [&>svg]:size-5",
          density.target,
          shape.circle,
          motionTactile,
          focusRing,
          tone.text[variant],
          isTonal && tone.tonal[variant],
          (isTonal || isAcrylic) && !isDisabled && stateLayer.tonal,
          appearance === "ghost" && "bg-transparent",
          appearance === "ghost" && !isDisabled && stateLayer.quiet,
          isTonal && elevation.raised,
          isTonal && !isDisabled && state.recess,
          isAcrylic && material.acrylicDense,
          isAcrylic && elevation.floating,
          isDisabled ? state.disabled : state.enabled,
          className
        )}
      >
        {/* The mark occupies one slot at both states: a fixed 20px box, so a nested icon node cannot
            change the mark's size and the loading spinner lands in the box the icon had. */}
        {loading ? (
          <Spinner size="small" className={cn("size-5")} />
        ) : icon ? (
          <span className={cn("inline-flex size-5 shrink-0 items-center justify-center [&>svg]:size-5")} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
