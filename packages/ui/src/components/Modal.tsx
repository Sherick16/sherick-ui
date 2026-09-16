"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { type ReactNode, useRef } from "react";
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
import { ModalContent } from "./ModalContent";
import { ModalFooter } from "./ModalFooter";
import { ModalHeader } from "./ModalHeader";

export interface ModalProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
}

const Modal = ({ children, open, onClose, className }: ModalProps) => {
  const popupRef = useRef<HTMLDivElement>(null);

  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={({ open: isOpen }) =>
            cn(
              "fixed inset-0 z-50 bg-sherick-scrim/[0.38] backdrop-blur-[var(--sui-scrim-blur,6px)]",
              isOpen ? motion.scrimIn : motion.scrimOut
            )
          }
        />
        <BaseDialog.Viewport className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto p-4 sm:p-8">
          <BaseDialog.Popup
            ref={popupRef}
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
              <X className="size-5" aria-hidden="true" />
            </BaseDialog.Close>

            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
