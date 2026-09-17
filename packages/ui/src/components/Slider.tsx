"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import React, { forwardRef, type ComponentProps } from "react";
import { cn } from "@/libs/utils";
import {
  elevation,
  focusRingWithin,
  material,
  motion,
  selectable,
  shape,
  state,
  tone,
} from "./ui.common";

export interface SliderProps
  extends Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "children"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Identifies the field when a form is submitted. */
  name?: string;
  form?: string;
  /** Styles the slider's own column. */
  className?: string;
}

/**
 * A single thumb on a groove. The ref and every prop other than `className` reach the
 * thumb — the part a user grabs, and the element that carries the accessible name, so a
 * slider without a visible label is named with `aria-label` directly on the component.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step,
      disabled,
      name,
      form,
      className,
      ...thumbProps
    },
    ref
  ) => {
    return (
      <BaseSlider.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={(nextValue) => onValueChange?.(nextValue as number)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        name={name}
        form={form}
        className={cn("flex w-full flex-col", disabled && state.disabled, className)}
      >
        <BaseSlider.Control className={cn("group flex touch-none select-none items-center py-3")}>
          {/* The groove is the quieter matte step, so a raised handle still separates from it. */}
          <BaseSlider.Track
            className={cn("h-1.5 w-full", shape.pill, selectable.surface, material.matteQuiet)}
          >
            {/* The range ends under the handle's centre, exactly where Base UI reports the value.
                The handle's own matte tone is what makes the range visibly stop: an accent range
                with an accent handle was one continuous shape. */}
            <BaseSlider.Indicator
              className={cn(shape.pill, tone.strong.primary, motion.travel)}
            />
            {/* A compact matte cap rather than a filled disc: the accent belongs to the range,
                and the handle takes it only while the pointer is on it. Its fill is the one that
                separates from both the groove it travels and the page behind it, which is what
                keeps it findable — at rest, and while the slider is disabled. */}
            <BaseSlider.Thumb
              {...thumbProps}
              ref={ref}
              className={cn(
                "size-4",
                shape.circle,
                motion.travel,
                elevation.control,
                material.handle,
                state.engaged,
                focusRingWithin
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
