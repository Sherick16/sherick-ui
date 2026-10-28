import React, { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/libs/utils";
import { iconStroke } from "./ui.common";
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

/* The box a size names. A bare Spinner carries it on its wrapper and the loader fills the wrapper, so a
   slot's `className` (a 20px icon slot, a full-size target) sizes the whole mark. A Spinner with visible
   children keeps the box on the loader, because the wrapper is then a row that holds the copy beside it. */
const sizeBox = {
  small: "size-4",
  medium: "size-8",
  large: "size-10",
} as const;

/* The short names are the Sherick scale; the long ones are the loader's own, kept so existing callers do not
   change. */
export type SpinnerSize = "small" | "medium" | "large" | "sm" | "md" | "lg";

const loaderSizes: Record<"sm" | "md" | "lg", "small" | "medium" | "large"> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

export interface SpinnerProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children">,
    VariantProps<typeof spinnerVariants> {
  /** The loader's size. `sm`, `md` and `lg` are aliases of `small`, `medium` and `large`. */
  size?: SpinnerSize | null;
  /**
   * What the work is, read to a screen reader. A spinner with a label, or with visible children, is a status
   * that announces itself. A spinner with neither is decoration, and assistive technology skips it.
   */
  label?: string;
  /** Visible copy beside the loader. */
  children?: ReactNode;
}

/* Work that is running is announced once, by the element that owns the label. A control that shows a
   spinner in its own slot (a Button while it loads) has no label of its own, so the control's `aria-busy`
   is what tells assistive technology the work is running, and the spinner adds no second status region. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size, show, label, children, className, ...props }, ref) => {
    const loaderSize = size === "sm" || size === "md" || size === "lg" ? loaderSizes[size] : size;
    const decorative = label === undefined && children === undefined;
    const boxed = children === undefined;
    const box = sizeBox[loaderSize ?? "medium"];

    return (
      <span
        {...props}
        ref={ref}
        role={label || children ? "status" : undefined}
        aria-hidden={decorative ? true : undefined}
        className={cn(spinnerVariants({ show }), boxed && box, className)}
      >
        <HugeiconsIcon
          icon={Loading03Icon}
          aria-hidden="true"
          className={cn(iconStroke.glyph, "text-current", motionActivitySpin, boxed ? "size-full" : box)}
        />
        {label ? <span className={cn("sr-only")}>{label}</span> : null}
        {children}
      </span>
    );
  }
);

Spinner.displayName = "Spinner";
