"use client";

import React, { forwardRef, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { shape, text, tone, type } from "./ui.common";
import DismissButton from "./DismissButton";
import StatusMark from "./StatusMark";
import { Variant } from "./ui.types";

/* What a keyboard can land on. A disabled element is dropped by the `:disabled` check in the helper. */
const focusable = "a[href], button, input, select, textarea, [tabindex], [contenteditable='true']";

/**
 * Moves focus off a node that is about to leave the page, so a dismissed alert or a removed chip does
 * not drop focus onto the body. The reader's place goes to the next focusable element that follows the
 * node in its scope, then to the one before it, and only then to the scope itself. The scope is the
 * nearest role group, so a removed chip keeps focus inside its ChipGroup.
 *
 * Call it before the node is removed: once the node has left, there is nothing left to measure from.
 */
export const focusNeighbour = (node: HTMLElement) => {
  const scope = node.closest<HTMLElement>('[role="group"]') ?? node.parentElement;
  if (!scope) return;

  const candidates = Array.from(scope.querySelectorAll<HTMLElement>(focusable)).filter(
    (element) => !node.contains(element) && !element.matches(":disabled")
  );
  const next = candidates.find((element) => node.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
  const previous = candidates
    .filter((element) => node.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING)
    .pop();
  const target = next ?? previous;
  if (target) {
    target.focus();
    return;
  }

  /* A container is not focusable by default. It takes a tab index only for the moment focus lands on
     it, and gives the attribute back as soon as focus leaves. */
  if (!scope.hasAttribute("tabindex")) {
    scope.tabIndex = -1;
    scope.addEventListener("blur", () => scope.removeAttribute("tabindex"), { once: true });
  }
  scope.focus();
};

/** How an alert is announced to assistive technology. `none` leaves it silent. */
export type AlertAnnounce = "none" | "status" | "alert";

export interface AlertProps extends Omit<ComponentPropsWithoutRef<"div">, "role"> {
  children: ReactNode;
  variant?: Variant;
  /** Whether the alert has a dismiss control. */
  closeable?: boolean;
  /** The dismiss control's accessible name. Override it when the surface's language is not the default. */
  dismissLabel?: string;
  /**
   * How the alert is announced. `alert` interrupts the reader, `status` is read politely, and `none`
   * adds no live role. Danger and warning default to `alert`, and every other variant to `status`.
   */
  announce?: AlertAnnounce;
  /** Whether the alert is shown, when the application owns that state. */
  open?: boolean;
  /** Whether the alert starts shown, for one that owns its own dismissal. */
  defaultOpen?: boolean;
  /** Reports `false` when the alert is dismissed, for a controlled alert or to observe an uncontrolled one. */
  onOpenChange?: (open: boolean) => void;
  /** Fires when the alert is dismissed, before its open state changes. */
  onDismiss?: () => void;
}

/* An alert reports; it is not something the reader acts on. Its default is therefore the neutral
   soft surface, with the accent spent only on its small status mark, so an informational line never
   competes with the one priority action in the view. A semantic variant tints the whole surface,
   because there the colour carries meaning (§10). */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      children,
      variant = "secondary",
      className,
      closeable = false,
      dismissLabel = "Dismiss alert",
      announce,
      open,
      defaultOpen = true,
      onOpenChange,
      onDismiss,
      ...props
    },
    ref
  ) => {
    const element = useRef<HTMLDivElement | null>(null);
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const isOpen = open ?? uncontrolled;
    const role = announce ?? (variant === "danger" || variant === "warning" ? "alert" : "status");

    /* The same node answers both the forwarded ref and the dismissal's focus move. */
    const setElement = (node: HTMLDivElement | null) => {
      element.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    if (!isOpen) return null;

    const dismiss = () => {
      if (element.current) focusNeighbour(element.current);
      onDismiss?.();
      if (open === undefined) setUncontrolled(false);
      onOpenChange?.(false);
    };

    return (
      <div
        {...props}
        ref={setElement}
        role={role === "none" ? undefined : role}
        className={cn(
          "flex min-w-0 items-start gap-3 px-4 py-3.5 [overflow-wrap:anywhere]",
          shape.control,
          tone.soft[variant],
          text.high,
          className
        )}
      >
        {/* The status mark is a **first-line** mark: an alert's copy wraps, and a mark centred on the
            whole block would drift to the middle of it. The slot takes the first line's own height,
            so the mark is centred on the line it belongs to with no offset. */}
        <span className={cn("flex h-6 shrink-0 items-center")}>
          <StatusMark variant={variant} />
        </span>
        <div className={cn("min-w-0 flex-1", type.body)}>{children}</div>
        {/* The dismissal is a first-line affordance too. Its 44px target is taller than the line it
            belongs to, so the negative margins give the excess back on both vertical edges, and the
            end padding is pulled back toward the surface's edge: that padding exists to make the target
            big, and it must not read as a trailing void. The mark stays where the pointer found it. */}
        {closeable && (
          <DismissButton label={dismissLabel} size="compact" inRow onClick={dismiss} className={cn("-me-3 -my-2.5")} />
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";
