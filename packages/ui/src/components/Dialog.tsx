"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, {
  forwardRef,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
  useRef,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRing,
  motion,
  overlay,
  shape,
  state,
  stateLayer,
  text,
} from "./ui.common";
import { DialogContent } from "./DialogContent";
import { DialogDescription } from "./DialogDescription";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";

export interface DialogProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

type DialogComponent = ForwardRefExoticComponent<DialogProps & RefAttributes<HTMLDivElement>> & {
  Header: typeof DialogHeader;
  Description: typeof DialogDescription;
  Content: typeof DialogContent;
  Footer: typeof DialogFooter;
};

const Dialog = forwardRef<HTMLDivElement, DialogProps>(({
  children,
  open,
  defaultOpen,
  onOpenChange,
  className,
}, forwardedRef) => {
  const popupRef = useRef<HTMLDivElement | null>(null);

  const setPopupRef = (node: HTMLDivElement | null) => {
    popupRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(nextOpen) => {
        onOpenChange?.(nextOpen);
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={({ open: isOpen }) =>
            cn(
              "fixed inset-0 z-50 bg-sherick-scrim/[0.38] backdrop-blur-[var(--sui-scrim-blur)]",
              isOpen ? motion.scrimIn : motion.scrimOut
            )
          }
        />
        <BaseDialog.Viewport
          className={cn("fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto p-4 sm:p-8")}
        >
          <BaseDialog.Popup
            ref={setPopupRef}
            initialFocus={popupRef}
            tabIndex={-1}
            className={({ open: isOpen }) =>
              cn(
                "relative w-full max-w-lg outline-none",
                overlay.dialog,
                isOpen ? motion.overlayIn : motion.overlayOut,
                className
              )
            }
          >
            <BaseDialog.Close
              aria-label="Close dialog"
              className={cn(
                density.target,
                shape.circle,
                text.medium,
                "hover:text-sherick-ink",
                motion.release,
                focusRing,
                stateLayer.quiet,
                state.press,
                state.enabled,
                "absolute right-4 top-4 inline-flex items-center justify-center"
              )}
            >
              <X className={cn("size-5")} aria-hidden="true" />
            </BaseDialog.Close>

            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}) as DialogComponent;

Dialog.displayName = "Dialog";
Dialog.Header = DialogHeader;
Dialog.Description = DialogDescription;
Dialog.Content = DialogContent;
Dialog.Footer = DialogFooter;

export default Dialog;
