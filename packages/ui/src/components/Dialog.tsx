"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, {
  forwardRef,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
  useRef,
} from "react";
import { cn } from "@/libs/utils";
import { DialogContent } from "./DialogContent";
import { DialogDescription } from "./DialogDescription";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";
import { DialogDismiss, DialogSurface } from "./DialogSurface";

export interface DialogProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's open-change callback, event details included. */
  onOpenChange?: BaseDialog.Root.Props["onOpenChange"];
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
      onOpenChange={(nextOpen, eventDetails) => {
        onOpenChange?.(nextOpen, eventDetails);
      }}
    >
      {/* The dialog focuses its own surface rather than the first control in it: a dialog's
          content is read before it is acted on, and its close button is not the reason it opened. */}
      <DialogSurface className={cn(className)} popupRef={setPopupRef} initialFocus={popupRef}>
        <DialogDismiss label="Close dialog" />

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
