"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  elevation,
  focusRing,
  motionComponent,
  pressable,
  shape,
  stateLayer,
  surface,
  toneActiveMap,
  toneHoverMap,
  toneSurfaceMap,
  toneTextMap,
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

    return (
      <button
        ref={ref}
        {...props}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex min-h-11 min-w-11 items-center justify-center p-2.5 [&>svg]:size-5",
          shape.circle,
          motionComponent,
          focusRing,
          toneTextMap[variant],
          appearance === "tonal" && toneSurfaceMap[variant],
          appearance === "tonal" && !isDisabled && elevation.raised,
          appearance === "tonal" && !isDisabled && "active:shadow-sherick-pressed",
          appearance === "acrylic" && surface.acrylicDense,
          appearance === "ghost" && "bg-transparent",
          appearance === "tonal" && !isDisabled && stateLayer.tonal,
          appearance === "ghost" && !isDisabled && toneHoverMap[variant],
          appearance === "ghost" && !isDisabled && toneActiveMap[variant],
          appearance === "acrylic" && !isDisabled && "hover:brightness-110 active:brightness-95",
          !isDisabled && pressable,
          isDisabled ? "cursor-not-allowed opacity-45 shadow-none" : "cursor-pointer",
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
