"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React, { forwardRef, useRef, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import Command, { type CommandProps } from "./Command";
import { DialogDescription } from "./DialogDescription";
import { DialogHeader } from "./DialogHeader";
import { DialogDismiss, DialogSurface } from "./DialogSurface";

export interface CommandPaletteProps extends Omit<CommandProps, "className" | "id"> {
  /** The surface's own heading. It names the dialog. */
  title: string;
  /** Supporting copy beneath the heading, when the surface needs it. */
  description?: ReactNode;
  /**
   * The element the trigger's own props are handed to — usually a Sherick `Button`. The palette
   * opens from whatever this renders, so the control that opens it looks like the control it is.
   */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: BaseDialog.Root.Props["onOpenChange"];
  /** Adds to the dialog surface's own shell. */
  className?: string;
}

/**
 * The same command list as a surface that owns the viewport: a palette. It is a `Dialog` — Base's
 * dialog root, the shared `DialogSurface`, the shared header, description and dismissal — with one
 * difference: the surface exists to be typed into, so the search field takes the initial focus and
 * the commands are the answer to what was typed.
 *
 * The palette keeps no open state of its own. Base owns modality, the portal, the focus trap, the
 * first-Escape dismissal and the restoration; the action reports what ran and the primitive's own
 * `actionsRef.close()` dismisses the surface, which is also what resets an uncontrolled query —
 * the control unmounts with the popup it was rendered in.
 *
 * It composes Base's dialog root and the shared surface rather than the `Dialog` component, because
 * the two things a palette adds are both contracts of the surface: the search field is the initial
 * focus, and a run command closes the surface through Base's own actions instead of through an
 * open state kept here.
 */
const CommandPalette = forwardRef<HTMLInputElement, CommandPaletteProps>(({
  title,
  description,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  className,
  onAction,
  ...commandProps
}, forwardedRef) => {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const actionsRef = useRef<BaseDialog.Root.Actions | null>(null);

  const setSearchRef = (node: HTMLInputElement | null) => {
    searchRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      actionsRef={actionsRef}
    >
      {trigger && <BaseDialog.Trigger render={trigger} />}

      {/* The search field is the initial focus, and Base still owns everything else the surface
          does: the trap, the dismissal, the restoration to whatever opened it. */}
      <DialogSurface className={cn(className)} initialFocus={searchRef}>
        <DialogDismiss label="Close command palette" />
        <DialogHeader>{title}</DialogHeader>
        {description && <DialogDescription>{description}</DialogDescription>}

        <div className={cn("px-6 pt-3 pb-5 sm:px-7")}>
          <Command
            {...commandProps}
            onAction={(value) => {
              onAction?.(value);
              /* One dismissal for the whole palette: the action reports what ran, and the surface
                 the primitive owns closes. A command with no `onAction` still dismisses, because
                 the palette's own contract is that running something leaves the palette. */
              actionsRef.current?.close();
            }}
            ref={setSearchRef}
          />
        </div>
      </DialogSurface>
    </BaseDialog.Root>
  );
});

CommandPalette.displayName = "CommandPalette";

export default CommandPalette;
