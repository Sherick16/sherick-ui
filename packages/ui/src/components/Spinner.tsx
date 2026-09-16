import React from "react";
import { Loader2 } from "lucide-react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/libs/utils";

const spinnerVariants = cva("flex-col items-center justify-center", {
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

const loaderVariants = cva("animate-spin text-current motion-reduce:animate-none", {
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

export interface SpinnerContentProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
}

export function Spinner({ size, show, children, className }: SpinnerContentProps) {
  return (
    <span className={spinnerVariants({ show })} role="status" aria-live="polite">
      <Loader2 aria-hidden="true" className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  );
}
