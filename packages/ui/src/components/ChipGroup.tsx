"use client";

import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import React, { Children, forwardRef, isValidElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { Chip, type ChipProps } from "./Chip";

/* The one development check here. Bundlers replace `process.env.NODE_ENV` in published code, and the
   `typeof` guard keeps an unbundled page from throwing on it. */
declare const process: { env: { NODE_ENV?: string } } | undefined;

export interface ChipGroupProps
  extends Omit<BaseToggleGroup.Props<string>, "multiple" | "className" | "render"> {
  children: ReactNode;
  /**
   * Whether several chips can be held at once. A filter row usually can, so this defaults to
   * `true` — the opposite of the primitive's own default, and the one deliberate difference
   * between this group and a `ToggleGroup`.
   */
  multiple?: boolean;
  /** Styles the group's own row. The chips style themselves. */
  className?: string;
}

/* A toggle chip without a value is a control the group cannot hold: its selection never reaches the
   group's value, so it looks chosen and is not. A tag is not a toggle, so a dismissible tag is exempt, and
   a passive tag is `Chip.Tag`. Only direct children are checked, the ones the caller wrote. */
const warnWithoutValue = (children: ReactNode) => {
  if (typeof process === "undefined" || process.env.NODE_ENV === "production") return;
  Children.forEach(children, (child) => {
    if (
      isValidElement<ChipProps>(child) &&
      child.type === Chip &&
      child.props.value === undefined &&
      child.props.onRemove === undefined
    ) {
      console.warn(
        "ChipGroup: a Chip inside a group needs a `value`, so the group can hold its selection. Use `Chip.Tag` for a passive tag."
      );
    }
  });
};

/**
 * A row of chips sharing one value. It is the primitive's group with a chip row's own anatomy:
 * no track, because a chip is a control in its own right rather than a segment of one — and
 * Base UI still owns the group value, the roving tab index and the arrow keys.
 *
 * A tag inside the group is not a toggle, so it takes no part in the shared value and no part in
 * the roving focus; its dismiss control is reachable by Tab like any other control.
 */
export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(
  ({ children, multiple = true, className, ...groupProps }, ref) => {
    warnWithoutValue(children);

    return (
      <BaseToggleGroup
        {...groupProps}
        ref={ref}
        multiple={multiple}
        className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      >
        {children}
      </BaseToggleGroup>
    );
  }
);

ChipGroup.displayName = "ChipGroup";

export default ChipGroup;
