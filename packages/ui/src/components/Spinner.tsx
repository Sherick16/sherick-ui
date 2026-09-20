import React from "react";
import { Loader2 } from "lucide-react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/libs/utils";
import { motionActivitySpin } from "./ui.motion";

/* The root is `shrink-0` because a Spinner is a **mark**: a control that puts one in a row with a
   label is substituting it for an icon, and a mark that shrank under a long label would change
   the control's own balance as it entered and left the loading state. */
const spinnerVariants = cva("flex shrink-0 flex-col items-center justify-center", {
  variants: {
    show: {
      true: "flex",
      false: "hidden",
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva(`text-current ${motionActivitySpin}`, {
  variants: {
    size: {
      small: "size-4",
      medium: "size-8",
      large: "size-10",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

export interface SpinnerProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
}

export function Spinner({ size, show, children, className }: SpinnerProps) {
  return (
    <span className={cn(spinnerVariants({ show }))} role="status" aria-live="polite">
      <Loader2 aria-hidden="true" className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  );
}
