"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import React, { type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { overlay, stacking } from "./ui.common";
import { motionPresenceAnchored } from "./ui.motion";
import type { OverlayAlign, OverlaySide } from "./ui.types";

export interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: BasePopover.Root.Props["onOpenChange"];
}

export interface PopoverTriggerProps {
  /**
   * The element the trigger's own props are handed to — usually a Sherick `Button`. The surface
   * opens from whatever this renders, so the trigger looks like the control it is.
   */
  render?: ReactElement;
  children?: ReactNode;
  /** Adds to the rendered element. The trigger writes no visual rules of its own. */
  className?: string;
}

export interface PopoverContentProps {
  children: ReactNode;
  /** Adds to the popup's own shell. The sheet's material, shape and elevation are the recipe's. */
  className?: string;
  /** The edge the sheet is anchored to. Its entrance grows from whichever edge it resolves to. */
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
  alignOffset?: number;
}

/**
 * The anchored surface a control opens to show free-form content. Base UI owns the portal,
 * anchor positioning, collision handling, outside interaction, Escape and focus restoration;
 * Sherick UI owns the sheet and the geometry its entrance grows from.
 *
 * `Trigger` hands Base's trigger props to whatever the caller renders — usually a Sherick `Button`
 * through its `render` prop — so the control that opens the surface looks like the control it is.
 *
 * This is the whole of the surface Sherick UI publishes to a consumer: the parts below accept the
 * capabilities this package supports, not the primitive's complete prop set. Composing a Base
 * primitive is how this component is built; it is not what it promises.
 */
type PopoverComponent = ((props: PopoverProps) => React.JSX.Element) & {
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
};

const PopoverTrigger = ({ ...props }: PopoverTriggerProps) => <BasePopover.Trigger {...props} />;

const PopoverContent = ({
  children,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset,
}: PopoverContentProps) => {
  return (
    <BasePopover.Portal>
      {/* The whole popup is one fixed layer: its own height beyond the viewport scrolls inside the
          sheet, and its width is what the anchor and the viewport allow rather than a preferred
          size the layout would have to absorb. */}
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn(stacking.float)}
      >
        <BasePopover.Popup
          className={cn(
            "w-max max-w-[min(24rem,var(--available-width))] max-h-[var(--available-height)] overflow-y-auto p-5",
            overlay.popup,
            motionPresenceAnchored,
            className
          )}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
};

const Popover = (({ children, open, defaultOpen, onOpenChange }: PopoverProps) => {
  return (
    <BasePopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BasePopover.Root>
  );
}) as PopoverComponent;

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;

export default Popover;
