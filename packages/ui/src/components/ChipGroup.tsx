"use client";

import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import React, { forwardRef, type ReactNode } from "react";
import { cn } from "@/libs/utils";

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
