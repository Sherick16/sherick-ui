"use client";

import type { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import ToggleGroup from "./ToggleGroup";
import { Variant } from "./ui.types";

export interface SegmentedControlOption {
  value: string;
  label: ReactNode;
  /** A mark before the label. The segment's accessible name stays the label. */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<ComponentProps<"div">, "onChange" | "defaultValue" | "children"> {
  options: SegmentedControlOption[];
  /** The chosen option. This is the controlled counterpart of `defaultValue`. */
  value?: string;
  defaultValue?: string;
  /**
   * Fires when another option is chosen. Base UI's own callback, event details included, so the
   * change it describes can be cancelled before the group commits it.
   */
  onValueChange?: (value: string, eventDetails: BaseToggleGroup.ChangeEventDetails) => void;
  variant?: Variant;
  disabled?: boolean;
  /** Styles the control's own track. The segments style themselves. */
  className?: string;
}

/**
 * One choice out of a few, in a single track. It is a `ToggleGroup` with single selection and an
 * options array: the primitive owns the group value, the roving tab index and the arrow keys, and
 * this component decides that the choice is exclusive, that it can never be empty, and how the
 * options are described.
 *
 * "Never empty" is two rules. Left uncontrolled with no `defaultValue`, the control starts on the
 * first option that is not disabled — so a segmented control is never a row of unselected segments
 * waiting to be told what they are — and the press that would release the option it already holds
 * is vetoed rather than committed. A controlled `value` is the caller's to keep inside `options`.
 *
 * It names itself the way a tab list does — through `aria-label` / `aria-labelledby` — because it
 * is one control holding one value rather than a group of labelled controls.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      variant = "primary",
      disabled,
      className,
      ...groupProps
    },
    ref
  ) => {
    const fallback = options.find((option) => !option.disabled)?.value ?? options[0]?.value;
    const uncontrolledDefault = defaultValue ?? fallback;

    return (
      <ToggleGroup
        {...groupProps}
        ref={ref}
        multiple={false}
        value={value === undefined ? undefined : [value]}
        defaultValue={
          value === undefined && uncontrolledDefault !== undefined
            ? [uncontrolledDefault]
            : undefined
        }
        onValueChange={(next, eventDetails) => {
          const selected = next[0];
          if (selected !== undefined) onValueChange?.(selected, eventDetails);
        }}
        disabled={disabled}
        className={cn(className)}
      >
        {options.map((option) => (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            variant={variant}
            disabled={option.disabled}
            /* A segmented control always holds a choice, so the press that would release the one
               it holds is vetoed instead. Base runs this before it commits the group's value and
               lets it cancel that commit. */
            onPressedChange={(pressed, details) => {
              if (!pressed) details.cancel();
            }}
            className={cn("flex-1")}
          >
            {option.icon && (
              <span
                className={cn("inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4")}
                aria-hidden="true"
              >
                {option.icon}
              </span>
            )}
            {option.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    );
  }
);

SegmentedControl.displayName = "SegmentedControl";

export default SegmentedControl;
