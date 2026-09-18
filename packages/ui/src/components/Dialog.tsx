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
import { density, focusRing, shape, state, stateLayer, text } from "./ui.common";
import { motionTactileCompact } from "./ui.motion";
import { DialogContent } from "./DialogContent";
import { DialogDescription } from "./DialogDescription";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";
import { DialogSurface } from "./DialogSurface";

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
      {/* The dialog focuses its own surface rather than the first control in it: a dialog's
          content is read before it is acted on, and its close button is not the reason it opened. */}
      <DialogSurface className={cn(className)} popupRef={setPopupRef} initialFocus={popupRef}>
        <BaseDialog.Close
          aria-label="Close dialog"
          className={cn(
            density.target,
            shape.circle,
            text.medium,
            "hover:text-sherick-ink",
            motionTactileCompact,
            focusRing,
            stateLayer.quiet,
            state.enabled,
            "absolute right-4 top-4 inline-flex items-center justify-center"
          )}
        >
          <X className={cn("size-5")} aria-hidden="true" />
        </BaseDialog.Close>

        {children}
      </DialogSurface>
    </BaseDialog.Root>
  );
}) as DialogComponent;

Dialog.displayName = "Dialog";
Dialog.Header = DialogHeader;
Dialog.Description = DialogDescription;
Dialog.Content = DialogContent;
Dialog.Footer = DialogFooter;

export default Dialog;
