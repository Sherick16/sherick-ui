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
