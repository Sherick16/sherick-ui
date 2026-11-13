"use client";

import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import React, { Children, forwardRef, isValidElement, useCallback, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { Chip, type ChipProps } from "./Chip";
import { useEdgeFade, withEdgeFade } from "./edge-fade";

/* The one development check here. Bundlers replace `process.env.NODE_ENV` in published code, and the
   `typeof` guard keeps an unbundled page from throwing on it. */
declare const process: { env: { NODE_ENV?: string } } | undefined;

/**
 * What a row of chips does when they do not fit its width. `wrap` (the default) starts a new line;
 * `scroll` keeps one line that scrolls inside itself, with an edge fade on each side that has more
 * chips beyond it (§19).
 */
export type ChipGroupOverflow = "wrap" | "scroll";

export interface ChipGroupProps
  extends Omit<BaseToggleGroup.Props<string>, "multiple" | "className" | "render"> {
  children: ReactNode;
  /**
   * Whether several chips can be held at once. A filter row usually can, so this defaults to
   * `true` — the opposite of the primitive's own default, and the one deliberate difference
   * between this group and a `ToggleGroup`.
   */
  multiple?: boolean;
  /** Whether the chips wrap onto new lines or scroll along one line. */
  overflow?: ChipGroupOverflow;
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
/* A scrolling row clips what lies outside it, and a chip draws outside its own box: its focus ring sits
   3px outside it (5px with its width), and its raised shadow falls up to 9px below it in dark. The row
   therefore pads its ends by the ring's reach and its block edges by the shadow's, and hangs by the same
   amounts, so the chips keep the edges of the content beside them while their shadow and ring stay inside
   the clip. Its parent needs 6px of inline padding for the hang. A chip keeps its width rather than
   shrinking to fit. */
const scrollRow =
  "-mx-1.5 -my-2.5 flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto px-1.5 py-2.5 scroll-px-5 [&>*]:shrink-0";

export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(
  ({ children, multiple = true, overflow = "wrap", className, style, ...groupProps }, ref) => {
    warnWithoutValue(children);

    /* Only a scrolling row is measured: a wrapping one never overflows its width. The caller's ref and
       the measured row are the same element. */
    const scrolls = overflow === "scroll";
    const edge = useEdgeFade<HTMLDivElement>();
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        edge.ref(scrolls ? node : null);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [edge.ref, ref, scrolls]
    );

    return (
      <BaseToggleGroup
        {...groupProps}
        ref={setRef}
        multiple={multiple}
        style={withEdgeFade(style, scrolls ? edge.mask : undefined)}
        className={cn(scrolls ? scrollRow : "flex min-w-0 flex-wrap items-center gap-2", className)}
      >
        {children}
      </BaseToggleGroup>
    );
  }
);

ChipGroup.displayName = "ChipGroup";

export default ChipGroup;
