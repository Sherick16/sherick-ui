"use client";

import { Button } from "@base-ui/react/button";
import React, { forwardRef, useEffect, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRing,
  iconSlot,
  material,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";
import { motionInkPress, motionTactile } from "./ui.motion";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

/* `text` is the flat target a Button's text appearance is; `ghost` is the same target under its earlier
   name, and both render identically. `filled` is the one priority action in a view. */
export type IconButtonAppearance = "tonal" | "filled" | "text" | "ghost" | "acrylic";
/* `target` is a 20px mark in the 44px target. `compact` is a 16px mark in that same target, beside 14px
   copy: the target never shrinks below the accessible floor, whatever its mark. */
export type IconButtonSize = "target" | "compact";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  appearance?: IconButtonAppearance;
  size?: IconButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  /**
   * The element the button renders as, such as a router link. The button's classes and its own props
   * are merged onto it, so the link keeps the button's look and its own navigation.
   */
  render?: ReactElement;
}

/* `process` exists in a bundler's build and not necessarily in a browser, so the check reads it only
   where it is defined, and the warning is never part of a production bundle's behaviour. */
const isDevelopment = typeof process !== "undefined" && process.env.NODE_ENV !== "production";

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    variant = "primary",
    appearance = "tonal",
    size = "target",
    icon,
    className,
    loading = false,
    disabled,
    type = "button",
    render,
    ...props
  }, ref) => {
    /* An icon alone says nothing to a screen reader, so the caller names it. The warning is for the
       developer who did not; it does not change what renders. */
    const isNamed = Boolean(props["aria-label"] || props["aria-labelledby"]);
    useEffect(() => {
      if (isDevelopment && !isNamed) {
        console.warn("IconButton has no accessible name. Pass `aria-label` or `aria-labelledby`, because an icon alone says nothing to a screen reader.");
      }
    }, [isNamed]);

    /* A busy button is inert for hover and press, but it is not disabled. Only a real `disabled` takes
       the native attribute and the dimmed step. A loading button stays focusable, so Enter keeps focus
       on it, and Base's disabled gate stops its click handler from running a second time. */
    const isNativeButton = render === undefined || render.type === "button";
    /* An element that carries an `href` is a link, so it keeps its link semantics; Base UI would otherwise
       give it `role="button"`. Any other element is a button to Base UI. */
    const isLink = render !== undefined && (render.props as { href?: unknown }).href !== undefined;
    const isInert = disabled || loading;
    const isFlat = appearance === "ghost" || appearance === "text";
    const isFilled = appearance === "filled";
    const isTonal = appearance === "tonal";
    const isAcrylic = appearance === "acrylic";
    const mark = size === "compact" ? iconSlot.compact : iconSlot.normal;

    return (
      <Button
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
          "group inline-flex items-center justify-center p-2.5",
          density.target,
          shape.circle,
          /* A flat target shows only its mark, so compressing the 44px target would shrink the ground under
             the pointer for no visible gain: the mark takes the press, as a dialog's close does. A tonal,
             filled or acrylic disc *is* the visible target, and presses like a button. */
          !isFlat && motionTactile,
          focusRing,
          !isFilled && tone.text[variant],
          isTonal && tone.tonal[variant],
          isFilled && tone.strong[variant],
          (isTonal || isAcrylic) && !isInert && (isTonal && variant === "secondary" ? stateLayer.tonalNeutral : stateLayer.tonal),
          isFilled && !isInert && stateLayer.filled,
          isFlat && "bg-transparent",
          isFlat && !isInert && stateLayer.quiet,
          (isTonal || isFilled) && elevation.raised,
          (isTonal || isFilled) && !isInert && state.recess,
          isAcrylic && material.acrylicDense,
          isAcrylic && elevation.floating,
          disabled ? state.disabled : loading ? state.busy : state.enabled,
          className
        )}
      >
        {/* The mark occupies one slot at both states, so a nested icon node cannot change the mark's size and
            the loading spinner lands in the box the icon had. */}
        {loading ? (
          <span className={cn(mark)}>
            <Spinner size="small" className={cn("size-full")} />
          </span>
        ) : icon ? (
          <span className={cn(mark, isFlat && !isInert && motionInkPress)} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
