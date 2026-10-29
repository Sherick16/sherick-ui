"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import React, { forwardRef, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRing,
  iconSlot,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";
import { motionTactile } from "./ui.motion";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

export type ButtonAppearance = "filled" | "tonal" | "text";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  /** The mark before the label. */
  icon?: ReactNode;
  /** The mark after the label, such as an arrow or a chevron. It follows the writing direction. */
  trailingIcon?: ReactNode;
  loading?: boolean;
  /**
   * The element the button renders as, such as a router link. The button's classes and its own props
   * are merged onto it, so the link looks and presses like a button and keeps its own navigation.
   */
  render?: ReactElement;
}

/* The mark follows the type step beside it (§10): a compact label takes the compact slot. */
const slotMap: Record<ButtonSize, string> = {
  sm: iconSlot.compact,
  md: iconSlot.normal,
  lg: iconSlot.prominent,
};

const sizeMap: Record<ButtonSize, string> = {
  sm: `${density.compact} px-4 py-2`,
  md: `${density.normal} px-6 py-3`,
  lg: `${density.prominent} px-8 py-4`,
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = "primary",
    appearance = "tonal",
    size = "md",
    icon,
    trailingIcon,
    className,
    loading = false,
    disabled,
    type = "button",
    render,
    ...props
  }, ref) => {
    /* A busy button is inert for hover and press, but it is not disabled. Only a real `disabled` takes
       the native attribute and the dimmed step. A loading button stays focusable, so Enter keeps focus
       on it, and Base's disabled gate stops its click handler from running a second time. */
    const isNativeButton = render === undefined || render.type === "button";
    /* An element that carries an `href` is a link, so it keeps its link semantics; Base UI would otherwise
       give it `role="button"`. Any other element is a button to Base UI. */
    const isLink = render !== undefined && (render.props as { href?: unknown }).href !== undefined;
    const isInert = disabled || loading;
    /* The action ladder: text sits flat, tonal and filled are raised and recess while held. The
       priority action is never flatter than the one beside it. */
    const isRaised = appearance !== "text";
    const isTactile = isRaised && !isInert;
    /* The spinner takes the leading slot. With only a trailing mark it takes that slot instead, so the
       control keeps its width; with no mark at all it covers the hidden label. */
    const spinnerTrails = loading && !icon && Boolean(trailingIcon);

    return (
      <BaseButton
        {...props}
        {...(isLink ? { role: undefined } : undefined)}
        ref={ref}
        render={render}
        nativeButton={isNativeButton}
        type={isNativeButton ? type : undefined}
        disabled={isInert}
        focusableWhenDisabled={loading && !disabled}
        aria-busy={loading || undefined}
        className={cn(
          "relative inline-flex min-w-0 max-w-full items-center justify-center gap-2 font-medium tracking-[-0.01em]",
          shape.pill,
          sizeMap[size],
          motionTactile,
          focusRing,
          appearance === "filled" && tone.strong[variant],
          appearance === "filled" && !isInert && stateLayer.filled,
          appearance === "tonal" && tone.tonal[variant],
          appearance === "tonal" && tone.text[variant],
          appearance === "tonal" && !isInert && (variant === "secondary" ? stateLayer.tonalNeutral : stateLayer.tonal),
          appearance === "text" && tone.text[variant],
          appearance === "text" && !isInert && stateLayer.quiet,
          isRaised && elevation.raised,
          isTactile && state.recess,
          disabled ? state.disabled : loading ? state.busy : state.enabled,
          className
        )}
      >
        {/* A mark occupies one slot whatever is inside it. The slot is a fixed box sized by the
            button's type step, so a nested node — a wrapped mark, a status dot — cannot change the
            control's width, and the loading mark lands in the box the icon had. `[&>svg]` normalizes
            direct SVG artwork; sizing nested artwork is the caller's business, as §17 says. */}
        {loading && !spinnerTrails ? (
          <span className={cn(slotMap[size], !icon && "absolute")}>
            <Spinner size="small" className={cn("size-full")} />
          </span>
        ) : icon ? (
          <span className={cn(slotMap[size])} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {/* Retain one label subtree and its accessible name while the spinner occupies its footprint. */}
        <span className={cn("min-w-0 [overflow-wrap:anywhere]", loading && !icon && !trailingIcon && "opacity-0")}>{children}</span>
        {spinnerTrails ? (
          <span className={cn(slotMap[size])}>
            <Spinner size="small" className={cn("size-full")} />
          </span>
        ) : trailingIcon ? (
          <span className={cn(slotMap[size])} aria-hidden="true">
            {trailingIcon}
          </span>
        ) : null}
      </BaseButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
