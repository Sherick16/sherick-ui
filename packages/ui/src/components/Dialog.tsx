"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, {
  forwardRef,
  type ComponentProps,
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
import { DialogSurface, DialogTrigger, splitTriggers } from "./DialogSurface";

export interface DialogProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's open-change callback, event details included. */
  onOpenChange?: BaseDialog.Root.Props["onOpenChange"];
  className?: string;
  /** The accessible name of the dismissal control. Defaults to "Close dialog". */
  closeLabel?: string;
}

/**
 * The close control of a dialog. It is Base's own close part, so whatever the caller renders closes
 * the dialog through Base, with no open state of the caller's own.
 */
export type DialogCloseProps = ComponentProps<typeof BaseDialog.Close>;

export const DialogClose = (props: DialogCloseProps) => <BaseDialog.Close {...props} />;

type DialogComponent = ForwardRefExoticComponent<DialogProps & RefAttributes<HTMLDivElement>> & {
  Header: typeof DialogHeader;
  Description: typeof DialogDescription;
  Content: typeof DialogContent;
  Footer: typeof DialogFooter;
  Trigger: typeof DialogTrigger;
  Close: typeof DialogClose;
};

const Dialog = forwardRef<HTMLDivElement, DialogProps>(({
  children,
  open,
  defaultOpen,
  onOpenChange,
  className,
  closeLabel = "Close dialog",
}, forwardedRef) => {
  const popupRef = useRef<HTMLDivElement | null>(null);

  const setPopupRef = (node: HTMLDivElement | null) => {
    popupRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  /* A trigger stays in the page, where the reader acts, while the header, content and footer are the
     portaled surface. Triggers are split out so a caller can write them among the surface's parts. */
  const { triggers, content } = splitTriggers(children, DialogTrigger);

  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(nextOpen, eventDetails) => {
        onOpenChange?.(nextOpen, eventDetails);
      }}
    >
      {triggers}
      {/* The dialog focuses its own surface rather than the first control in it: a dialog's
          content is read before it is acted on, and its close button is not the reason it opened. */}
      <DialogSurface
        className={cn(className)}
        popupRef={setPopupRef}
        initialFocus={popupRef}
        closeLabel={closeLabel}
      >
        {content}
      </DialogSurface>
    </BaseDialog.Root>
  );
}) as DialogComponent;

Dialog.displayName = "Dialog";
Dialog.Header = DialogHeader;
Dialog.Description = DialogDescription;
Dialog.Content = DialogContent;
Dialog.Footer = DialogFooter;
Dialog.Trigger = DialogTrigger;
Dialog.Close = DialogClose;

export default Dialog;
