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
import { motionTactileCompact } from "./ui.motion";
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
        "flex items-center gap-3 px-4 py-3.5",
        shape.surface,
        tone.soft[variant],
        text.high,
        className
      )}
    >
      <Icon aria-hidden="true" className={cn("size-5 shrink-0", tone.text[variant])} />
      <div className={cn("min-w-0 flex-1 text-sm leading-6")}>{children}</div>
      {closeable && (
        <Button
          type="button"
          aria-label="Dismiss alert"
          onClick={() => {
            onDismiss?.();
            setIsVisible(false);
          }}
          className={cn(
            "ml-1 inline-flex shrink-0 items-center justify-center",
            density.target,
            shape.circle,
            focusRingInset,
            motionTactileCompact,
            stateLayer.quiet,
            state.enabled
          )}
        >
          <X aria-hidden="true" className={cn("size-4")} />
        </Button>
      )}
    </div>
  );
};
