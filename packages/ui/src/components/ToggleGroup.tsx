"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import React, {
  forwardRef,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from "react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRingInset,
  selectable,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { motionTactile } from "./ui.motion";
import { Variant } from "./ui.types";

export interface ToggleGroupProps
  extends Omit<BaseToggleGroup.Props<string>, "className" | "render"> {
  /** Styles the group's own track. The segments style themselves. */
  className?: string;
}

export interface ToggleGroupItemProps
  extends Omit<
    Toggle.Props<string>,
    "value" | "children" | "className" | "pressed" | "defaultPressed" | "render" | "style"
  > {
  /** The item's identity in the group. Base UI requires it on every grouped toggle. */
  value: string;
  children: ReactNode;
  /** The tone the segment takes once it is selected. */
  variant?: Variant;
  /** Styles the segment's own box. */
  className?: string;
}

/**
 * One option in a `ToggleGroup`. Segments are equal objects in one groove: unselected they show
 * the track through, and the selected one takes the selected tone and rises out of it.
 */
const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, children, variant = "primary", className, ...toggleProps }, ref) => {
    return (
      <Toggle
        {...toggleProps}
        ref={ref}
        value={value}
        className={(toggleState) =>
          cn(
            "relative inline-flex items-center justify-center gap-2 whitespace-nowrap px-5 py-2 font-medium",
            density.compact,
            shape.row,
            motionTactile,
            /* The ring is drawn inside: an offset one around a segment collides with its
               neighbours in the same track. */
            focusRingInset,
            state.enabled,
            state.effectiveDisabled,
            toggleState.pressed
              ? cn(tone.selected[variant], elevation.control, !toggleState.disabled && state.recess)
              : cn(text.medium, !toggleState.disabled && "hover:text-sherick-ink"),
            /* A held segment still answers the pointer: hover is one tonality step over whatever
               fill it holds, and selection is not a reason to stop responding. */
            !toggleState.disabled && stateLayer.quiet,
            className
          )
        }
      >
        {children}
      </Toggle>
    );
  }
);

ToggleGroupItem.displayName = "ToggleGroup.Item";

type ToggleGroupComponent = ForwardRefExoticComponent<
  ToggleGroupProps & RefAttributes<HTMLDivElement>
> & {
  Item: typeof ToggleGroupItem;
};

/**
 * A set of toggle buttons sharing one value. Base UI owns the roving tab index, the arrow keys,
 * the group value and whether one or several segments can be held; Sherick UI owns the recessed
 * track and the raised selected segment.
 *
 * `SegmentedControl` is the single-choice form of this object with an options array — it renders
 * this group and its items rather than a second implementation.
 */
const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, ...groupProps }, ref) => {
    return (
      <BaseToggleGroup
        {...groupProps}
        ref={ref}
        className={cn(
          "relative inline-flex items-center gap-1 p-1",
          "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
          shape.control,
          /* The same selection well a switch, a checkbox, a radio and a slider groove sit in. */
          selectable.surface,
          selectable.rest,
          className
        )}
      />
    );
  }
) as ToggleGroupComponent;

ToggleGroup.displayName = "ToggleGroup";
ToggleGroup.Item = ToggleGroupItem;

export default ToggleGroup;
