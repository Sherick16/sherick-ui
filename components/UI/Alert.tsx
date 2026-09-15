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
        "flex items-center gap-3 px-4 py-3.5",
        shape.surface,
        toneSoftMap[variant],
        className
      )}
    >
      <Icon aria-hidden="true" className={cn("h-5 w-5 shrink-0", toneTextMap[variant])} />
      <div className="min-w-0 flex-1 text-sm leading-6">{children}</div>
      {closeable && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={() => setIsVisible(false)}
          className={cn(
            "ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-current",
            "hover:bg-sherick-ink/[0.08] active:bg-sherick-ink/[0.13]",
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
