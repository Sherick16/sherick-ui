"use client";

import React, { type ReactNode, useState } from "react";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingInset,
  motion,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { Variant } from "./ui.types";

const iconMap = {
  primary: Info,
  secondary: Info,
  danger: XCircle,
  warning: AlertCircle,
  success: CheckCircle,
};

/* An alert is a tinted matte surface: the tone marks its meaning on the surface and
   the icon, while the copy stays at full text emphasis so it never fights the color. */
export const Alert = ({
  children,
  variant = "primary",
  className,
  closeable = false,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  closeable?: boolean;
}) => {
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
      <div className="min-w-0 flex-1 text-sm leading-6">{children}</div>
      {closeable && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={() => setIsVisible(false)}
          className={cn(
            "ml-1 inline-flex shrink-0 items-center justify-center",
            density.target,
            shape.circle,
            focusRingInset,
            motion.release,
            stateLayer.quiet,
            state.press,
            state.enabled
          )}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
};
