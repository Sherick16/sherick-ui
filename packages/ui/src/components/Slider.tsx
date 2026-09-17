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
            {/* The range ends where the handle begins, not under it: it reserves the handle's own
                half-width plus four pixels of air on its end, so the fill stops short and the
                surface shows through between them. The reservation is a transparent end border
                with a padding-box clip — geometry, not a drawn edge — and it is a logical edge,
                so it follows the direction the slider runs in. The groove beyond the handle is
                the track's own fill, which Base does not let a component cut. */}
            <BaseSlider.Indicator
              className={cn(
                "box-border border-e-[10px] border-e-transparent bg-clip-padding",
                shape.pill,
                tone.strong.primary,
                motion.travel
              )}
            />
            {/* A compact vertical capsule rather than a dot: taller than the groove it travels, so
                it reads as a grip that was made for the hand, and narrow enough that the range's
                tail lands behind it and the fill visibly ends where the handle begins. The accent
                belongs to the range, and the handle takes it only while the pointer is on it. Its
                fill is the one that separates from both the groove it travels and the page behind
                it, which is what keeps it findable — at rest, and while the slider is disabled. */}
            <BaseSlider.Thumb
              {...thumbProps}
              ref={ref}
              className={cn(
                "h-5 w-3",
                shape.pill,
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
