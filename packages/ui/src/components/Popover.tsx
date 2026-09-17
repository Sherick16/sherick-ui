"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import React, { type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { motion, overlay, stacking } from "./ui.common";

export interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: BasePopover.Root.Props["onOpenChange"];
}

export interface PopoverContentProps {
  children: ReactNode;
  /** Adds to the popup's own shell. The sheet's material, shape and elevation are the recipe's. */
  className?: string;
  side?: ComponentProps<typeof BasePopover.Positioner>["side"];
  align?: ComponentProps<typeof BasePopover.Positioner>["align"];
  sideOffset?: ComponentProps<typeof BasePopover.Positioner>["sideOffset"];
  alignOffset?: ComponentProps<typeof BasePopover.Positioner>["alignOffset"];
}

/**
 * The anchored surface a control opens to show free-form content. Base UI owns the portal,
 * anchor positioning, collision handling, outside interaction, Escape and focus restoration;
 * Sherick UI owns the sheet and the geometry its entrance grows from.
 *
 * `Trigger` is Base's trigger, so the consumer decides what opens the surface — usually a
 * Sherick `Button` through its `render` prop.
 */
type PopoverComponent = ((props: PopoverProps) => React.JSX.Element) & {
  Trigger: typeof BasePopover.Trigger;
  Content: typeof PopoverContent;
};

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
          className={({ open }) =>
            cn(
              "w-max max-w-[min(24rem,var(--available-width))] max-h-[var(--available-height)] overflow-y-auto p-5",
              overlay.popup,
              open ? motion.overlayIn : motion.overlayOut,
              className
            )
          }
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

Popover.Trigger = BasePopover.Trigger;
Popover.Content = PopoverContent;

export default Popover;
