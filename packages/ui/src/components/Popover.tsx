"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import React, { forwardRef, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { headingRhythm, overlay, stacking, text, type } from "./ui.common";
import { motionPresenceAnchored } from "./ui.motion";
import type { OverlayAlign, OverlaySide, PartProps } from "./ui.types";

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

/** The close control of a popover, as Base's own close part. It closes the surface through Base. */
export type PopoverCloseProps = ComponentProps<typeof BasePopover.Close>;

/** The heading's own `h2`. Base names the popup from it when it is present. */
export type PopoverTitleProps = PartProps<"h2">;

/** The line under the title, as the element Base wires up as the popup's description. */
export type PopoverDescriptionProps = PartProps<"p">;

export interface PopoverContentProps extends Omit<PartProps<"div">, "children" | "className"> {
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
  Title: typeof PopoverTitle;
  Description: typeof PopoverDescription;
  Close: typeof PopoverClose;
};

const PopoverTrigger = ({ ...props }: PopoverTriggerProps) => <BasePopover.Trigger {...props} />;

const PopoverClose = (props: PopoverCloseProps) => <BasePopover.Close {...props} />;

/* The popup is the element a popover's attributes reach: `id` and `aria-label` name it when there is no
   title, and a ref reaches the same node. */
const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(({
  children,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset,
  ...props
}, ref) => {
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
          {...props}
          ref={ref}
          className={cn(
            "w-max max-w-[min(24rem,var(--available-width))] max-h-[var(--available-height)] overflow-y-auto p-5 [overflow-wrap:anywhere]",
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
});

PopoverContent.displayName = "PopoverContent";

/* The surface's heading takes the `title` role, and the primitive names the popup from it. */
const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(({ children, className, ...props }, ref) => (
  <BasePopover.Title {...props} ref={ref} className={cn("m-0", type.title, text.high, className)}>{children}</BasePopover.Title>
));

PopoverTitle.displayName = "PopoverTitle";

/* The line under the title, which the primitive wires up as the popup's description. */
const PopoverDescription = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(({ children, className, ...props }, ref) => (
  <BasePopover.Description {...props} ref={ref} className={cn("m-0", headingRhythm.title, type.body, text.medium, className)}>{children}</BasePopover.Description>
));

PopoverDescription.displayName = "PopoverDescription";

const Popover = (({ children, open, defaultOpen, onOpenChange }: PopoverProps) => {
  return (
    <BasePopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BasePopover.Root>
  );
}) as PopoverComponent;

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Title = PopoverTitle;
Popover.Description = PopoverDescription;
Popover.Close = PopoverClose;

export default Popover;
