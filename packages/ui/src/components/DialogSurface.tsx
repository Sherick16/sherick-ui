"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { type ComponentProps, type ReactNode, type Ref } from "react";
import { X } from "lucide-react";
import { cn } from "@/libs/utils";
import { density, focusRing, overlay, shape, stacking, state, stateLayer, text } from "./ui.common";
import {
  motionFeedback,
  motionInkPress,
  motionPresenceModal,
  motionPresenceScrim,
  motionPresenceSheet,
} from "./ui.motion";

/**
 * Where a viewport-owning surface is attached. `center` is a dialog: it has no edge, so it rises
 * into the middle of the viewport and takes the modal presence. Every other value is a sheet
 * attached to that edge of the viewport, and slides out of it.
 */
export type DialogAttachment = "center" | "bottom" | "top" | "left" | "right";

export interface DialogSurfaceProps {
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
}

/* Which way the surface is placed, how much room it takes, and the offset it arrives from. A
   sheet keeps every corner except the ones that would lift it off its own edge: an attached
   corner would draw a gap where the surface meets the viewport, and squaring it is anatomy
   while `shape` still supplies the radius. */
const attachmentLayout: Record<
  DialogAttachment,
  { viewport: string; popup: string; from: string; presence: string }
> = {
  center: {
    viewport: "min-h-full items-center justify-center overflow-y-auto p-4 sm:p-8",
    popup: "max-w-lg",
    from: "",
    presence: motionPresenceModal,
  },
  bottom: {
    viewport: "items-end justify-center overflow-hidden",
    popup: "flex max-h-[85vh] flex-col rounded-b-none",
    from: "[--sui-sheet-from-y:100%]",
    presence: motionPresenceSheet,
  },
  top: {
    viewport: "items-start justify-center overflow-hidden",
    popup: "flex max-h-[85vh] flex-col rounded-t-none",
    from: "[--sui-sheet-from-y:-100%]",
    presence: motionPresenceSheet,
  },
  left: {
    viewport: "items-stretch justify-start overflow-hidden",
    popup: "flex w-full max-w-[min(28rem,90vw)] flex-col rounded-l-none",
    from: "[--sui-sheet-from-x:-100%]",
    presence: motionPresenceSheet,
  },
  right: {
    viewport: "items-stretch justify-end overflow-hidden",
    popup: "flex w-full max-w-[min(28rem,90vw)] flex-col rounded-r-none",
    from: "[--sui-sheet-from-x:100%]",
    presence: motionPresenceSheet,
  },
};

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
}: DialogSurfaceProps) => {
  const geometry = attachmentLayout[attachment];
  /* A surface with no edge is a dialog; one attached to an edge is a sheet, and the two shells
     differ only in the corner role they take. */
  const shell = attachment === "center" ? overlay.dialog : overlay.sheet;

  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={cn(overlay.scrim, motionPresenceScrim)} />
      <BaseDialog.Viewport
        className={cn("fixed inset-0 flex", stacking.float, geometry.viewport)}
      >
        <BaseDialog.Popup
          ref={popupRef}
          initialFocus={initialFocus}
          tabIndex={-1}
          className={cn(
            "relative w-full outline-none",
            geometry.from,
            shell,
            /* The attachment's own sizing and its squared edge come after the shell: `cn` keeps the
               last class of a conflicting group, so a directional radius written before the
               shell's corner role would be dropped by the shell rather than override it. */
            geometry.popup,
            geometry.presence,
            className
          )}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
};

export interface DialogDismissProps {
  /**
   * The control's accessible name. It is required rather than derived: the mark is the only thing
   * rendered, and what it dismisses is the caller's fact — a dialog, a sheet, or a surface whose
   * own wording is better than a generic one.
   */
  label: string;
  className?: string;
}

/**
 * The dismissal control every viewport-owning surface carries, in the same place and with the
 * same press. It is a part rather than something the shell renders itself, because an
 * `AlertDialog` answers with its own actions and must not offer a second way out.
 */
export const DialogDismiss = ({ label, className }: DialogDismissProps) => (
  <BaseDialog.Close
    aria-label={label}
    className={cn(
      density.target,
      shape.circle,
      text.medium,
      "hover:text-sherick-ink",
      motionFeedback,
      focusRing,
      stateLayer.quiet,
      state.enabled,
      /* The mark is centred on the header's first line: the title's line box starts at the header's
         `pt-5` and is 28px tall, so a 44px target centred on it sits at `top-3` rather than `top-4`,
         and it is placed on the logical end so it follows the writing direction. Written after the
         state layer, which is `relative` itself, so `tailwind-merge` keeps this position. */
      "group absolute end-4 top-3 z-10 inline-flex items-center justify-center",
      className
    )}
  >
    {/* The target stays exactly where the pointer found it; the mark inside it carries the
        press. */}
    <span className={cn("inline-flex items-center justify-center", motionInkPress)}>
      <X className={cn("size-5")} aria-hidden="true" />
    </span>
  </BaseDialog.Close>
);

export default DialogSurface;
