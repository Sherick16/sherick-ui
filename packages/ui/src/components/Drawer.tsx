"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { createContext, useContext, useRef, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { text } from "./ui.common";
import { DialogDismiss, DialogSurface, type DialogAttachment } from "./DialogSurface";

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

export interface DrawerContentProps {
  children: ReactNode;
  /** Adds to the sheet's own surface. Its shell, elevation and presence are the recipe's. */
  className?: string;
}

export interface DrawerHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface DrawerDescriptionProps {
  children: ReactNode;
  className?: string;
}

export interface DrawerFooterProps {
  children: ReactNode;
  className?: string;
}

type DrawerComponent = ((props: DrawerProps) => React.JSX.Element) & {
  Trigger: typeof DrawerTrigger;
  Content: typeof DrawerContent;
  Header: typeof DrawerHeader;
  Description: typeof DrawerDescription;
  Footer: typeof DrawerFooter;
  Close: typeof DrawerClose;
};

/* Base's dialog root has no notion of an edge, so the side a sheet was given travels down to the
   sheet's own part through context rather than through a second prop a consumer would have to
   keep in step with the first. */
const SideContext = createContext<DrawerSide>("bottom");

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
const DrawerContent = ({ children, className }: DrawerContentProps) => {
  const side = useContext(SideContext);
  const popupRef = useRef<HTMLDivElement | null>(null);

  return (
    /* The sheet focuses its own surface rather than its first control: a sheet's content is read
       before it is acted on, and its close control is not the reason it opened. */
    <DialogSurface
      attachment={side}
      className={cn(className)}
      popupRef={popupRef}
      initialFocus={popupRef}
    >
      <DialogDismiss label="Close" />
      {/* The sheet scrolls as one region rather than growing: its own edge is clamped to the
          viewport, so a long sheet is read by scrolling it. */}
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain")}>
        {children}
      </div>
    </DialogSurface>
  );
};

const DrawerHeader = ({ children, className }: DrawerHeaderProps) => (
  <div className={cn("pt-5 pb-2 pl-6 pr-16 sm:pl-7", className)}>
    <BaseDialog.Title className={cn("text-xl font-semibold tracking-[-0.02em]", text.high)}>
      {children}
    </BaseDialog.Title>
  </div>
);

const DrawerDescription = ({ children, className }: DrawerDescriptionProps) => (
  <BaseDialog.Description
    className={cn("px-6 pt-2 text-sm leading-7 sm:px-7", text.medium, className)}
  >
    {children}
  </BaseDialog.Description>
);

/* Actions stay on the sheet's own surface: no divider, no second layer. */
const DrawerFooter = ({ children, className }: DrawerFooterProps) => (
  <div className={cn("mt-auto flex items-center justify-end gap-3 px-6 pb-6 pt-4 sm:px-7", className)}>
    {children}
  </div>
);

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
const Drawer = (({ children, side = "bottom", ...props }: DrawerProps) => {
  return (
    <SideContext.Provider value={side}>
      <BaseDialog.Root {...props}>{children}</BaseDialog.Root>
    </SideContext.Provider>
  );
}) as DrawerComponent;

Drawer.Trigger = DrawerTrigger;
Drawer.Content = DrawerContent;
Drawer.Header = DrawerHeader;
Drawer.Description = DrawerDescription;
Drawer.Footer = DrawerFooter;
Drawer.Close = DrawerClose;

export default Drawer;
