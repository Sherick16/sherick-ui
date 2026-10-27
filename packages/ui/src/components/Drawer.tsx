"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import { DialogDescription } from "./DialogDescription";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";
import { DialogSurface, type DialogAttachment } from "./DialogSurface";
import type { PartProps } from "./ui.types";

/**
 * The viewport edge a sheet is attached to. Sides are **physical** rather than logical: the
 * contract places the sheet against that edge of the screen rather than resolving a writing
 * direction the component cannot see, so a direction-sensitive placement is the consumer's own
 * `dir`-aware arrangement rather than an inferred one.
 */
export type DrawerSide = Exclude<DialogAttachment, "center">;

export interface DrawerProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: BaseDialog.Root.Props["onOpenChange"];
  /** The edge the sheet is attached to. */
  side?: DrawerSide;
  /** The accessible name of the sheet's dismissal control. Defaults to "Close". */
  closeLabel?: string;
}

export interface DrawerTriggerProps {
  /**
   * The element the trigger's own props are handed to — usually a Sherick `Button`. The sheet
   * opens from whatever this renders, so the control that opens it looks like the control it is.
   */
  render?: ReactElement;
  children?: ReactNode;
  /** Adds to the rendered element. The trigger writes no visual rules of its own. */
  className?: string;
}

/** The sheet's own surface element: the popup, which takes the rest props and the ref. */
export type DrawerContentProps = PartProps<"div">;

/** The header's own `div`. */
export type DrawerHeaderProps = PartProps<"div">;

/** The supporting line's own `p`. */
export type DrawerDescriptionProps = PartProps<"p">;

/** The footer's own `div`. */
export type DrawerFooterProps = PartProps<"div">;

type DrawerComponent = ((props: DrawerProps) => React.JSX.Element) & {
  Trigger: typeof DrawerTrigger;
  Content: typeof DrawerContent;
  Header: typeof DrawerHeader;
  Description: typeof DrawerDescription;
  Footer: typeof DrawerFooter;
  Close: typeof DrawerClose;
};

/* Base's dialog root has no notion of an edge, so the side a sheet was given, and the name of its
   dismissal control, travel down to the sheet's own parts through context rather than through a second
   prop a consumer would have to keep in step with the root. */
const DrawerContext = createContext<{ side: DrawerSide; closeLabel: string }>({
  side: "bottom",
  closeLabel: "Close",
});

const DrawerTrigger = ({ ...props }: DrawerTriggerProps) => <BaseDialog.Trigger {...props} />;

/**
 * The sheet itself: the plane behind it, the viewport, the edge-attached surface, and the
 * dismissal control every sheet carries. Base UI — through the same dialog root a `Dialog` uses —
 * owns the portal, focus trapping and restoration, document scroll locking, Escape and outside
 * dismissal; Sherick UI owns the surface and how it slides out of its edge.
 *
 * It is a `Dialog` that changed its attachment: there is no second modal system here, so a sheet
 * traps focus, restores it, locks the page and dismisses exactly as a dialog does. Use a `Dialog`
 * when the surface has no edge.
 */
const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(({ children, className, ...props }, ref) => {
  const { side, closeLabel } = useContext(DrawerContext);
  const contentRef = useRef<HTMLDivElement | null>(null);

  return (
    /* Focus the reading region, so native PageDown/Space scroll the sheet before a control
       has been visited. Base still owns initial focus and the focus trap. */
    <DialogSurface
      {...props}
      attachment={side}
      className={cn(className)}
      popupRef={ref}
      initialFocus={contentRef}
      closeLabel={closeLabel}
    >
      <div ref={contentRef} tabIndex={-1} className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [outline-style:none]")}>
        {children}
      </div>
    </DialogSurface>
  );
});

DrawerContent.displayName = "DrawerContent";

/* A sheet is a dialog with an edge, so its title and description are the dialog's own parts rather
   than copies that could drift from them. */
const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(({ className, ...props }, ref) => (
  <DialogHeader {...props} ref={ref} className={cn(className)} />
));

DrawerHeader.displayName = "DrawerHeader";

const DrawerDescription = forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(({ className, ...props }, ref) => (
  <DialogDescription {...props} ref={ref} className={cn(className)} />
));

DrawerDescription.displayName = "DrawerDescription";

/* The dialog's own footer, so a sheet's actions keep the dialog's insets. Like an AlertDialog's,
   it follows content with no padded body below it, so it opens its own space above. */
const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(({ className, ...props }, ref) => (
  <DialogFooter {...props} ref={ref} className={cn("pt-4", className)} />
));

DrawerFooter.displayName = "DrawerFooter";

/* The dismissal control as a part, for an action that closes the sheet from its own footer: Base
   hands the close behavior to whatever the caller renders. */
const DrawerClose = (props: ComponentProps<typeof BaseDialog.Close>) => (
  <BaseDialog.Close {...props} />
);

/**
 * A surface attached to one edge of the viewport: a bottom sheet, a side panel, a top drawer. It
 * is a `Dialog` with an edge rather than a second kind of modal — the same root, the same scrim,
 * the same focus trapping and restoration, the same Escape and outside dismissal, the same
 * document scroll locking and the same portal — and only the placement and the direction the
 * surface arrives from differ.
 *
 * Compose a `Drawer.Trigger` and a `Drawer.Content`; the header, description and footer parts
 * mirror a `Dialog`'s, because it is the same surface.
 */
const Drawer = (({ children, side = "bottom", closeLabel = "Close", ...props }: DrawerProps) => {
  const context = useMemo(() => ({ side, closeLabel }), [side, closeLabel]);

  return (
    <DrawerContext.Provider value={context}>
      <BaseDialog.Root {...props}>{children}</BaseDialog.Root>
    </DrawerContext.Provider>
  );
}) as DrawerComponent;

Drawer.Trigger = DrawerTrigger;
Drawer.Content = DrawerContent;
Drawer.Header = DrawerHeader;
Drawer.Description = DrawerDescription;
Drawer.Footer = DrawerFooter;
Drawer.Close = DrawerClose;

export default Drawer;
