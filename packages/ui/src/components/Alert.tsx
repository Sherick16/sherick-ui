"use client";

import { Button } from "@base-ui/react/button";
import React, { type ReactNode, useState } from "react";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingInset,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";
import { Variant } from "./ui.types";

const iconMap = {
  primary: Info,
  secondary: Info,
  danger: XCircle,
  warning: AlertCircle,
  success: CheckCircle,
};

export interface AlertProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  closeable?: boolean;
  onDismiss?: () => void;
}

export const Alert = ({
  children,
  variant = "primary",
  className,
  closeable = false,
  onDismiss,
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = iconMap[variant];

  if (!isVisible) return null;

  return (
    <div
      role={variant === "danger" || variant === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 px-4 py-3.5",
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
        <Icon className={cn("size-5", tone.text[variant])} />
      </span>
      <div className={cn("min-w-0 flex-1 text-sm leading-6")}>{children}</div>
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
            <X aria-hidden="true" className={cn("size-4")} />
          </span>
        </Button>
      )}
    </div>
  );
};
