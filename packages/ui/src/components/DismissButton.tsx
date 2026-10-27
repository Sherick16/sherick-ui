"use client";

import React, { forwardRef, type ComponentPropsWithoutRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/libs/utils";
import { density, focusRing, focusRingInset, iconSlot, iconStroke, shape, state, stateLayer } from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";

export interface DismissButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** The accessible name. A dismiss is icon-only, so it always has one of its own. */
  label: string;
  /**
   * `target` is a standalone close: a 20px mark in the 44px target. `compact` is a dismiss inside a
   * surface or a row — a chip, an alert, a toast — where the mark is 16px beside 14px copy. Both keep
   * the 44px target (§13, §14), so only the mark changes size.
   */
  size?: "target" | "compact";
  /** A dismiss inside a row takes the inset focus ring, so the ring stays within the row it belongs to. */
  inRow?: boolean;
}

/*
 * The one dismiss control. Its size is its mark, never its target: a dismiss keeps the same 44px hit
 * area whatever surface it sits in, so the pointer finds it in the same place. The mark takes the
 * press (`motionInkPress`) and the target stays still, as §11 asks; the glyph's own weight comes from
 * `iconStroke.glyph`, so it matches every other glyph in the library.
 */
const DismissButton = forwardRef<HTMLButtonElement, DismissButtonProps>(
  ({ label, size = "target", inRow = false, type = "button", className, ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        "group inline-flex shrink-0 items-center justify-center",
        density.target,
        shape.circle,
        motionFeedback,
        stateLayer.quiet,
        state.quietInk,
        inRow ? focusRingInset : focusRing,
        state.enabled,
        className
      )}
    >
      <span className={cn(size === "compact" ? iconSlot.compact : iconSlot.normal, motionInkPress)}>
        <HugeiconsIcon icon={Cancel01Icon} aria-hidden="true" className={cn(iconStroke.glyph)} />
      </span>
    </button>
  )
);

DismissButton.displayName = "DismissButton";

export default DismissButton;
