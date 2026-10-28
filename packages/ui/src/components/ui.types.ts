import type { ComponentPropsWithoutRef, ElementType } from "react";

export type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "success";

/**
 * The edge a floating surface is anchored to, and how it sits along that edge.
 *
 * These are this package's own names for the values it renders. A surface's entrance geometry is
 * written per edge, so the set is part of Sherick UI's contract rather than a pass-through of the
 * positioning library underneath it.
 */
export type OverlaySide =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "inline-start"
  | "inline-end";

export type OverlayAlign = "start" | "center" | "end";

/**
 * The props a primitive hands to the element it renders in its place (Base's `render`): the
 * button's own attributes, and the event and state wiring Base adds to them. The ref is passed
 * separately, so a trigger that forwards one takes it beside these props rather than inside them.
 *
 * The triggers of Menu, Popover, Drawer, Dialog and AlertDialog take this shape, so a trigger
 * built on any of them accepts the same element.
 */
export type TriggerProps = ComponentPropsWithoutRef<"button">;

/**
 * The props of the element a part renders, without its ref. A part that forwards a ref takes
 * the ref beside these props; `T` is the element the part is written as.
 */
export type PartProps<T extends ElementType> = ComponentPropsWithoutRef<T>;
