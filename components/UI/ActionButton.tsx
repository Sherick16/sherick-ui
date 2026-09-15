"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { styleMap } from "./ui.common";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  loading?: boolean;
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({
    children,
    variant = "primary",
    icon,
    className,
    loading = false,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        {...props}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "px-6 py-4 rounded-4xl bg-opacity-20 hover:bg-opacity-40 transition-all flex items-center justify-center",
          styleMap[variant] || styleMap.primary,
          isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className
        )}
      >
        {loading ? (
          <Spinner className="mr-2" size="small" />
        ) : icon ? (
          <span className="mr-2 inline-block align-middle">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
