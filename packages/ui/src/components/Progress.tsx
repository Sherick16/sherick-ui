"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { elevation, material, shape, text, tone } from "./ui.common";
import { motionActivityIndeterminate } from "./ui.motion";
import { Variant } from "./ui.types";

export interface ProgressProps
  extends Omit<ComponentProps<"div">, "children">,
    Pick<BaseProgress.Root.Props, "min" | "max" | "format" | "locale" | "getAriaValueText"> {
  /**
   * How far the work has come. Omit it, or pass `null`, for work whose extent is not known: the
   * bar then reports that it is working rather than where it is.
   */
  value?: number | null;
  /** The tone of the fill. */
  variant?: Variant;
  /** A visible label above the track. Base UI associates it with the bar. */
  label?: ReactNode;
  /**
   * Renders the formatted value opposite the label. A bar with no known value has no value to
   * show, so nothing is rendered for it while the bar is indeterminate.
   */
  showValue?: boolean;
  /** Styles the bar's own column. The track and the fill style themselves. */
  className?: string;
}

/**
 * How far along a task has come. Base UI owns the meter role, the value boundaries, the
 * percentage and the accessible text; Sherick UI owns the recessed groove, the accent fill and
 * the sweep an unknown extent reports itself with.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      variant = "primary",
      label,
      showValue = false,
      min,
      max,
      format,
      locale,
      getAriaValueText,
      className,
      ...rootProps
    },
    ref
  ) => {
    /* Base keeps the condition that decides whether the bar is indeterminate — a value that is
       absent or not finite — so the sweep is applied from the same reading rather than from a
       second opinion about the value. */
    const indeterminate = value == null || !Number.isFinite(value);
    const showFormattedValue = showValue && !indeterminate;

    return (
      <BaseProgress.Root
        {...rootProps}
        ref={ref}
        value={value ?? null}
        min={min}
        max={max}
        format={format}
        locale={locale}
        getAriaValueText={getAriaValueText}
        className={cn("flex w-full flex-col gap-2", className)}
      >
        {(label || showFormattedValue) && (
          <div className={cn("flex items-baseline justify-between gap-3")}>
            {label ? (
              <BaseProgress.Label className={cn("text-sm font-medium", text.high)}>
                {label}
              </BaseProgress.Label>
            ) : null}
            {showFormattedValue ? (
              <BaseProgress.Value className={cn("text-sm tabular-nums", text.medium)} />
            ) : null}
          </div>
        )}

        <BaseProgress.Track
          className={cn(
            "relative h-1.5 w-full overflow-hidden",
            shape.pill,
            /* A groove: sunk by its anatomy, at the quietest matte step, exactly like a slider's rail. */
            elevation.recessed,
            material.matteQuiet
          )}
        >
          <BaseProgress.Indicator
            /* Forced colors flattens the fill into its track, so the marker is what lets the
               stylesheet give the one part that carries the meaning a boundary. */
            data-sui-progress-indicator=""
            className={cn(
              "absolute inset-y-0 start-0",
              shape.pill,
              tone.strong[variant],
              indeterminate
                ? cn("w-2/5", motionActivityIndeterminate)
                : /* The measure itself is Base's: it writes the indicator's own width. */
                  "w-full"
            )}
          />
        </BaseProgress.Track>
      </BaseProgress.Root>
    );
  }
);

Progress.displayName = "Progress";

export default Progress;
