"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/libs/utils";
import DismissButton from "./DismissButton";
import { overlay, stacking } from "./ui.common";
import {
  motionPresenceModal,
  motionPresenceScrim,
  motionPresenceScrimUtility,
  motionPresenceSheet,
  motionPresenceUtility,
} from "./ui.motion";
import type { PartProps, TriggerProps } from "./ui.types";

/**
 * Where a viewport-owning surface is attached. `center` is a dialog: it has no edge, so it rises
 * into the middle of the viewport and takes the modal presence. Every other value is a sheet
 * attached to that edge of the viewport, and slides out of it.
 */
export type DialogAttachment = "center" | "bottom" | "top" | "left" | "right";

export interface DialogSurfaceProps extends Omit<PartProps<"div">, "children" | "className"> {
  children: ReactNode;
  /** Adds to the popup's own shell. The surface's shape, material and elevation are the recipe's. */
  className?: string;
  /** The popup element, for a caller that needs a handle on the surface itself. */
  popupRef?: Ref<HTMLDivElement>;
  /**
   * Base's initial-focus contract, passed through unchanged. Omitted means Base focuses the
   * first tabbable element inside the surface, which is what a confirmation wants: focus
   * lands on the safe action rather than on the destructive one.
   */
  initialFocus?: ComponentProps<typeof BaseDialog.Popup>["initialFocus"];
  /** The edge the surface is attached to. `center` is the default, and is a dialog. */
  attachment?: DialogAttachment;
  /**
   * The entrance tier. `modal` is the surface's own rise or slide. `utility` is the quick tier for a
   * surface a reader opened from the keyboard: opacity only, so it is there as soon as the key is
   * answered.
   */
  presence?: "modal" | "utility";
  /**
   * The accessible name of the dismissal control. Omitted, the surface carries none: an alert
   * dialog answers with its own actions and must not offer a second way out.
   */
  closeLabel?: string;
  /** Places the dismissal control where a surface's own title line sits, when that is not the dialog's. */
  closeClassName?: string;
}

/* Which way the surface is placed, how much room it takes, and the offset it arrives from. A
   sheet keeps every corner except the ones that would lift it off its own edge: an attached
   corner would draw a gap where the surface meets the viewport, and squaring it is anatomy
   while `shape` still supplies the radius. A sheet's viewport clips without becoming a scroll
   container: focusing its content would otherwise scroll away positive-edge travel. */
const attachmentLayout: Record<
  DialogAttachment,
  { viewport: string; popup: string; from: string; presence: string }
> = {
  center: {
    viewport: "min-h-full items-start justify-center overflow-y-auto p-4 sm:p-8",
    popup: "my-auto max-w-lg shrink-0",
    from: "",
    presence: motionPresenceModal,
  },
  bottom: {
    viewport: "items-end justify-center overflow-clip",
    popup: "flex max-h-[85dvh] flex-col rounded-b-none",
    from: "[--sui-sheet-from-y:100%]",
    presence: motionPresenceSheet,
  },
  top: {
    viewport: "items-start justify-center overflow-clip",
    popup: "flex max-h-[85dvh] flex-col rounded-t-none",
    from: "[--sui-sheet-from-y:-100%]",
    presence: motionPresenceSheet,
  },
  left: {
    viewport: "items-stretch justify-start overflow-clip rtl:flex-row-reverse",
    popup: "flex w-full max-w-[min(28rem,90vw)] flex-col rounded-l-none",
    from: "[--sui-sheet-from-x:-100%]",
    presence: motionPresenceSheet,
  },
  right: {
    viewport: "items-stretch justify-end overflow-clip rtl:flex-row-reverse",
    popup: "flex w-full max-w-[min(28rem,90vw)] flex-col rounded-r-none",
    from: "[--sui-sheet-from-x:100%]",
    presence: motionPresenceSheet,
  },
};

/* The dismissal sits on the dialog's first header line. That line starts at the header's `pt-5` and is
   28px tall, so a 44px target centred on it sits at `top-3` rather than `top-4`, and it is placed on the
   logical end so it follows the writing direction. The target's own state layer is `relative`, and this
   position comes after it, so `tailwind-merge` keeps it. */
const dismissPlacement = "absolute end-4 top-3 z-10";

/**
 * The visual shell every Sherick surface that owns the viewport shares: the scrim, the viewport
 * and the popup — a dialog in the middle, or a sheet attached to an edge. Base UI owns presence,
 * focus, dismissal, portals and document scroll locking; this owns only the arrangement and the
 * classes, so a dialog, an alert dialog and a sheet separate from the page, take focus and
 * dismiss identically instead of each maintaining its own copy of that policy.
 *
 * It renders Base's dialog parts — which are also the alert-dialog parts — so it must be
 * rendered inside a Base `Dialog.Root` or `AlertDialog.Root`.
 */
export const DialogSurface = ({
  children,
  className,
  popupRef,
  initialFocus,
  attachment = "center",
  presence = "modal",
  closeLabel,
  closeClassName,
  ...props
}: DialogSurfaceProps) => {
  const geometry = attachmentLayout[attachment];
  /* A surface with no edge is a dialog; one attached to an edge is a sheet, and the two shells
     differ only in the corner role they take. */
  const shell = attachment === "center" ? overlay.dialog : overlay.sheet;
  const entrance = presence === "utility" ? motionPresenceUtility : geometry.presence;
  /* The plane follows the surface it sits behind: a utility surface fades its scrim on the utility timing. */
  const scrim = presence === "utility" ? motionPresenceScrimUtility : motionPresenceScrim;

  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={cn(overlay.scrim, scrim)} />
      <BaseDialog.Viewport
        className={cn("fixed inset-0 flex", stacking.float, geometry.viewport)}
      >
        <BaseDialog.Popup
          {...props}
          ref={popupRef}
          initialFocus={initialFocus}
          tabIndex={-1}
          className={cn(
            "relative min-w-0 w-full [outline-style:none] [overflow-wrap:anywhere]",
            geometry.from,
            shell,
            /* The attachment's own sizing and its squared edge come after the shell: `cn` keeps the
               last class of a conflicting group, so a directional radius written before the
               shell's corner role would be dropped by the shell rather than override it. */
            geometry.popup,
            entrance,
            className
          )}
        >
          {closeLabel !== undefined ? (
            /* The dismissal is the surface's first part, so it is the first control a reader reaches
               after the surface itself, and it is the same control on every surface. */
            <BaseDialog.Close
              render={<DismissButton label={closeLabel} className={cn(dismissPlacement, closeClassName)} />}
            />
          ) : null}
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
};

export type DialogTriggerProps = TriggerProps & {
  /** The element the trigger's own props are handed to — usually a Sherick `Button`. */
  render?: ReactElement;
};

/**
 * The control that opens a dialog-family surface. It renders in the page rather than in the portal,
 * so the reader sees the control they pressed and the surface arrives from it. Base's trigger closes
 * the surface through its own root, so no open state is needed beside it.
 */
export const DialogTrigger = ({ render, ...props }: DialogTriggerProps) => (
  <BaseDialog.Trigger render={render} {...props} />
);

/**
 * Splits a surface's children into its triggers and its content. A trigger has to stay in the page,
 * because the portal holds only what the surface shows; everything else is the surface's own content.
 */
export const splitTriggers = (children: ReactNode, trigger: unknown) => {
  const triggers: ReactNode[] = [];
  const content: ReactNode[] = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === trigger) triggers.push(child);
    else content.push(child);
  }
  return { triggers, content };
};

export default DialogSurface;
