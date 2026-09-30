"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  elevation,
  focusRingWithin,
  material,
  selectable,
  shape,
  state,
  text,
  tone,
} from "./ui.common";
import { motionDirect } from "./ui.motion";

export interface SliderProps
  extends Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "children"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: BaseSlider.Root.Props<number>["onValueChange"];
  /** Fires when a change is committed — a drag released, a stepper pressed, a blur. */
  onValueCommitted?: BaseSlider.Root.Props<number>["onValueCommitted"];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Identifies the field when a form is submitted. */
  name?: string;
  form?: string;
  /** A visible label for the slider, for a slider that is not inside a `Field`. */
  label?: ReactNode;
  /** Styles the slider's own column. The handle is styled through `thumbClassName`. */
  className?: string;
  thumbClassName?: string;
  /**
   * Label props reach the handle, which is the only element a slider can name itself with; every
   * other prop, `className` included, styles the slider's root.
   */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * A single handle on a groove. The ref points at the handle, which is the part a user grabs.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onValueCommitted,
      min,
      max,
      step,
      disabled,
      name,
      form,
      label,
      className,
      thumbClassName,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...rootProps
    },
    ref
  ) => {
    return (
      <BaseSlider.Root
        {...rootProps}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        name={name}
        form={form}
        className={cn("flex w-full flex-col", state.effectiveDisabled, className)}
      >
        {label && <BaseSlider.Label className={cn("mb-2 text-sm font-medium", text.high)}>{label}</BaseSlider.Label>}
        <BaseSlider.Control className={cn("group flex touch-none select-none items-center py-3")}>
          {/* The groove is the matte step every sunk track takes; the handle separates from it by
              its own mid-emphasis fill and its control elevation. */}
          {/* The reservation the range leaves for the handle: its half-width (10px) plus 4px of
              air, owned here because both the groove and the range read it. */}
          <BaseSlider.Track
            className={cn(
              "h-1.5 w-full [--sui-slider-reserve:0.875rem]",
              shape.pill,
              selectable.surface,
              material.matteHigh
            )}
          >
            {/* The range stops short of the handle by the handle's own half-width plus its air, so
                the fill ends where the handle begins. One variable owns that reservation. */}
            <BaseSlider.Indicator
              className={cn(
                "box-border border-e-[length:var(--sui-slider-reserve)] border-e-transparent bg-clip-padding",
                shape.pill,
                tone.strong.primary,
                motionDirect
              )}
            />
            {/* The same round handle a switch thumb is: one family of parts the user moves. */}
            <BaseSlider.Thumb
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledby}
              ref={ref}
              data-sui-slider-thumb=""
              className={cn(
                "size-5",
                shape.circle,
                motionDirect,
                elevation.control,
                material.handle,
                state.engaged,
                focusRingWithin,
                thumbClassName
              )}
            />
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
    );
  }
);

Slider.displayName = "Slider";

export default Slider;
