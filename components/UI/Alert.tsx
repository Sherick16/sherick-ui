"use client";

import React, { type ReactNode, useState } from "react";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/libs/utils";
import { focusRing, styleMap } from "./ui.common";
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
        "p-4 rounded-4xl bg-opacity-20 flex items-center justify-between hover:bg-opacity-20",
        styleMap[variant],
        className
      )}
    >
      <div className="flex items-center">
        <Icon aria-hidden="true" className="w-5 h-5 mr-3" />
        <div>{children}</div>
      </div>
      {closeable && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={() => setIsVisible(false)}
          className={cn("ml-3 p-1 rounded-lg", focusRing)}
        >
          <X aria-hidden="true" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
