import React from "react";
import { Loader2 } from "lucide-react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/libs/utils";
import { motionActivitySpin } from "./ui.motion";

/* The mark's box belongs to the slot a control puts around it, not to this component: a labelled
   Spinner (`children` renders beside the loader) has to be able to shrink in a narrow row, so the
   non-shrinking half lives in the slot. */
const spinnerVariants = cva("flex flex-col items-center justify-center", {
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
