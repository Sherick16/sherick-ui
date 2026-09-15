"use client";

import React, { type ReactNode, useState } from "react";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/libs/utils";
import { focusRingInset, motionState, shape, toneSoftMap, toneTextMap } from "./ui.common";
import { Variant } from "./ui.types";

const iconMap = {
  primary: Info,
  secondary: Info,
  danger: XCircle,
  warning: AlertCircle,
  success: CheckCircle,
};

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
        "flex items-start justify-between gap-4 p-4",
        shape.surface,
        toneSoftMap[variant],
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon aria-hidden="true" className={cn("mt-0.5 h-5 w-5 shrink-0", toneTextMap[variant])} />
        <div className="min-w-0 text-sm leading-6">{children}</div>
      </div>
      {closeable && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={() => setIsVisible(false)}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-black/10 active:bg-black/15",
            motionState,
            focusRingInset
          )}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
