"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import React, { forwardRef, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import Button from "./Button";
import { DialogDescription } from "./DialogDescription";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";
import { DialogSurface } from "./DialogSurface";
import type { Variant } from "./ui.types";

export interface AlertDialogProps {
  /** The question the dialog asks. Base makes it the surface's accessible name. */
  title: ReactNode;
  /** What the confirmation will do. Base makes it the surface's accessible description. */
  description?: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  /** The action the confirmation performs. It runs before the dialog closes. */
  onConfirm?: () => void;
  /**
   * Runs for every user cancellation — the cancel action and Escape alike — because a keyboard
   * dismissal is the same decision as pressing the button. A dialog the application closes itself
   * is not a cancellation and reports through `onOpenChange` only.
   */
  onCancel?: () => void;
  /**
   * The tone of the confirm action. A confirmation that destroys something says so on the one
   * control that destroys it — the dialog surface itself never carries semantic color.
   */
  confirmVariant?: Variant;
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A dialog that asks one question and requires one answer. Its interaction contract differs from
 * `Dialog`: it is always modal, an outside press never dismisses it, and Base's default focus
 * lands on the first tabbable element — the cancel action — so a stray `Enter` cannot destroy
 * anything. Base owns presence, focus restoration, Escape and the `alertdialog` semantics; the
 * surface, typography and shape are the same ones `Dialog` uses.
 */
const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(({
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  onConfirm,
  onCancel,
  confirmVariant = "danger",
  className,
  onOpenChange,
  ...rootProps
}, ref) => {
  return (
    <BaseAlertDialog.Root
      {...rootProps}
      onOpenChange={(nextOpen, eventDetails) => {
        /* Escape is a cancellation, and it is read from Base's own reason for the change rather
           than from a key handler here: one place observes the closure, so a keyboard dismissal
           and the cancel action report the same thing. */
        if (!nextOpen && eventDetails.reason === "escape-key") onCancel?.();
        onOpenChange?.(nextOpen);
      }}
    >
      <DialogSurface className={cn(className)} popupRef={ref}>
        <DialogHeader>{title}</DialogHeader>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
        <DialogFooter>
          <BaseAlertDialog.Close
            render={
              <Button appearance="text" variant="secondary" onClick={onCancel}>
                {cancelLabel}
              </Button>
            }
          />
          <BaseAlertDialog.Close
            render={
              <Button appearance="filled" variant={confirmVariant} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            }
          />
        </DialogFooter>
      </DialogSurface>
    </BaseAlertDialog.Root>
  );
});

AlertDialog.displayName = "AlertDialog";


export default AlertDialog;
