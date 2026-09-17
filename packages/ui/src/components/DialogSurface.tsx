"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { type ComponentProps, type ReactNode, type Ref } from "react";
import { cn } from "@/libs/utils";
import { motion, overlay, stacking } from "./ui.common";

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
}

/**
 * The visual shell every Sherick dialog surface shares: the scrim, the viewport and the popup.
 * Base UI owns presence, focus, dismissal and the portal; this owns only the classes, so a
 * dialog and an alert dialog separate from the page and rise into place identically instead of
 * each maintaining its own copy of that policy.
 *
 * It renders Base's dialog parts — which are also the alert-dialog parts — so it must be
 * rendered inside a Base `Dialog.Root` or `AlertDialog.Root`.
 */
export const DialogSurface = ({ children, className, popupRef, initialFocus }: DialogSurfaceProps) => {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className={({ open }) => cn(overlay.scrim, open ? motion.scrimIn : motion.scrimOut)}
      />
      <BaseDialog.Viewport
        className={cn("fixed inset-0 flex min-h-full items-center justify-center overflow-y-auto p-4 sm:p-8", stacking.float)}
      >
        <BaseDialog.Popup
          ref={popupRef}
          initialFocus={initialFocus}
          tabIndex={-1}
          className={({ open }) =>
            cn(
              "relative w-full max-w-lg outline-none",
              overlay.dialog,
              open ? motion.overlayIn : motion.overlayOut,
              className
            )
          }
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
};

export default DialogSurface;
