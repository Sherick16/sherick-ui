"use client";

import { Button } from "@base-ui/react/button";
import React, { type ReactNode, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Cancel01Icon, CancelCircleIcon, CheckmarkCircle02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingInset,
  iconStroke,
  shape,
  state,
  stateLayer,
  text,
  tone,
  type,
} from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";
import { Variant } from "./ui.types";

const iconMap = {
  primary: InformationCircleIcon,
  secondary: InformationCircleIcon,
  danger: CancelCircleIcon,
  warning: Alert02Icon,
  success: CheckmarkCircle02Icon,
};

export interface AlertProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  closeable?: boolean;
  onDismiss?: () => void;
}

/* An alert reports; it is not something the reader acts on. Its default is therefore the neutral
   soft surface, with the accent spent only on its small status mark, so an informational line never
   competes with the one priority action in the view. A semantic variant tints the whole surface,
   because there the colour carries meaning (§10). */
export const Alert = ({
  children,
  variant = "secondary",
  className,
  closeable = false,
  onDismiss,
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const icon = iconMap[variant];

  if (!isVisible) return null;

  return (
    <div
      role={variant === "danger" || variant === "warning" ? "alert" : "status"}
      className={cn(
        "flex min-w-0 items-start gap-3 px-4 py-3.5 [overflow-wrap:anywhere]",
        shape.control,
        tone.soft[variant],
        text.high,
        className
      )}
    >
      {/* The status mark is a **first-line** mark: an alert's copy wraps, and a mark centred on the
          whole block would drift to the middle of it. The slot takes the first line's own height
          (`leading-6`), so the icon is centred on the line it belongs to with no offset. */}
      <span className={cn("flex h-6 shrink-0 items-center")} aria-hidden="true">
        <HugeiconsIcon icon={icon} aria-hidden="true" className={cn("size-5", iconStroke.glyph, variant === "secondary" ? tone.text.primary : tone.text[variant])} />
      </span>
      <div className={cn("min-w-0 flex-1", type.body)}>{children}</div>
      {/* The dismissal is a first-line affordance too: a 44px target is taller than the line it belongs
          to, so it is offset to that line and gives its excess back on **both** vertical edges — a
          top-only offset would leave the target's remaining 10px as extra space under a single line of
          copy, letting the target rather than the copy size the surface. Its target padding is
          likewise pulled back at the surface's end edge: that padding exists to make the target big,
          and it is not allowed to read as a trailing void. The target keeps the geometry the pointer
          found. */}
      {closeable && (
        <Button
          type="button"
          aria-label="Dismiss alert"
          onClick={() => {
            onDismiss?.();
            setIsVisible(false);
          }}
          className={cn(
            "group -me-2 -my-2.5 inline-flex shrink-0 items-center justify-center",
            density.target,
            shape.circle,
            focusRingInset,
            motionFeedback,
            stateLayer.quiet,
            state.enabled
          )}
        >
          {/* The target stays exactly where the pointer found it; the mark inside it carries the
              press. */}
          <span className={cn("inline-flex items-center justify-center", motionInkPress)}>
            <HugeiconsIcon icon={Cancel01Icon} aria-hidden="true" className={cn("size-4", iconStroke.glyph)} />
          </span>
        </Button>
      )}
    </div>
  );
};
