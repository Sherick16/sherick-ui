"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { X } from "lucide-react";
import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRing,
  focusRingInset,
  hitArea,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { motionFeedback, motionInkPress, motionTactile } from "./ui.motion";
import { Variant } from "./ui.types";

/** The parts every chip has, whichever of its two forms it takes. */
interface ChipAnatomy {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
}

/**
 * A chip is one of two things, and never both.
 *
 * * A **toggle chip** holds a selection. Supplying any of `checked`, `defaultChecked`,
 *   `onCheckedChange` or `value` makes it a toggle button, and it takes the props of one; inside a
 *   `ChipGroup` the group owns the value, exactly as it does for any grouped control.
 * * A **tag** holds no selection and may be dismissed. `onRemove` renders the dismiss control, and
 *   the tag takes the props of the passive element it is.
 *
 * The two cannot be combined: a control that both holds a value and deletes itself is one target
 * with two meanings, and a toggle is a `<button>` while a tag is a `<span>` containing its dismiss
 * control — a button cannot legally nest inside a button.
 */
export type ChipProps =
  | (ChipAnatomy &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "type"> & {
        /** The controlled counterpart of `defaultChecked`. */
        checked?: boolean;
        defaultChecked?: boolean;
        /** Fires when the chip's selection changes. Base UI's own callback, event details included. */
        onCheckedChange?: Toggle.Props<string>["onPressedChange"];
        /** The chip's identity inside a `ChipGroup`. */
        value?: string;
        /** A toggle is a button; it carries no dismiss control. Give the row a `ChipGroup`. */
        onRemove?: never;
        removeLabel?: never;
      })
  | (ChipAnatomy &
      HTMLAttributes<HTMLSpanElement> & {
        /** Renders a dismiss control. */
        onRemove?: () => void;
        /**
         * The dismiss control's accessible name. Defaults to `Remove <text>` when the chip's
         * children are a string, and to `Remove` otherwise.
         */
        removeLabel?: string;
        /** A tag holds nothing to select. */
        checked?: never;
        defaultChecked?: never;
        onCheckedChange?: never;
        value?: never;
        disabled?: never;
      });

/**
 * A compact control-sized object: a toggle button that holds a selection, or a tag that carries its
 * tone in its fill and can be dismissed.
 *
 * A toggle is raised and tactile because it is manipulated. A tag is flat because it is only read,
 * and it is passive in the markup as well: nothing about its own box is interactive, its copy keeps
 * its normal emphasis while its icon carries the semantic tone, and its only control is the dismiss
 * one. The ref points at the chip's own element — the button or the tag's span.
 */
export const Chip = forwardRef<HTMLElement, ChipProps>(
  (
    {
      children,
      variant = "primary",
      icon,
      checked,
      defaultChecked,
      onCheckedChange,
      value,
      onRemove,
      removeLabel,
      className,
      disabled,
      ...chipProps
    },
    ref
  ) => {
    const isToggle =
      value !== undefined ||
      checked !== undefined ||
      defaultChecked !== undefined ||
      onCheckedChange !== undefined;

    /* One ref for two elements: whichever one the chip turned out to be is what a caller means by
       "the chip". A callback ref is what keeps a hook-free component free of a conditional hook. */
    const setRef = (node: HTMLElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const content = (
      <>
        {icon && (
          <span
            className={cn(
              "inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4",
              !isToggle && tone.text[variant]
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <span className={cn("min-w-0 truncate")}>{children}</span>
      </>
    );

    if (isToggle) {
      return (
        <Toggle
          {...chipProps}
          ref={setRef}
          value={value}
          pressed={checked}
          defaultPressed={defaultChecked}
          onPressedChange={onCheckedChange}
          disabled={disabled}
          className={(toggleState) =>
            cn(
              "inline-flex min-w-0 max-w-full items-center gap-1.5 px-4 py-1.5 font-medium",
              density.compact,
              shape.control,
              motionTactile,
              focusRing,
              state.enabled,
              state.effectiveDisabled,
              /* Selection is a tone the chip takes, never a depth: the rest fill is the neutral
                 matte control step and the variant names the tone of the held state, exactly as a
                 segment inside its track and a switch inside its groove resolve it. The two fills
                 are alternatives rather than a stack — written as a stack, the rest step is the
                 last background in the list and `tailwind-merge` would keep it, leaving a held
                 chip neutral. */
              toggleState.pressed
                ? tone.selected[variant]
                : cn(
                    tone.tonal.secondary,
                    text.medium,
                    !toggleState.disabled && "hover:text-sherick-ink"
                  ),
              !toggleState.disabled && stateLayer.tonal,
              elevation.raised,
              !toggleState.disabled && state.recess,
              className
            )
          }
        >
          {content}
        </Toggle>
      );
    }

    const dismissLabel =
      removeLabel ??
      (typeof children === "string" ? `Remove ${children}` : "Remove");

    /* A tag's dismiss control is not one of a group's items, so the keys aimed at it are its own.
       The composite root answers Arrow/Home/End for its items in the bubble phase, and without
       this its roving navigation would take focus away from the control the user is standing on. */
    const keepOwnKeys = (event: React.KeyboardEvent<HTMLButtonElement>) =>
      event.stopPropagation();

    return (
      <span
        {...(chipProps as HTMLAttributes<HTMLSpanElement>)}
        ref={setRef}
        className={cn(
          "inline-flex min-w-0 max-w-full items-center gap-1.5 px-4 py-1.5 font-medium",
          density.compact,
          shape.control,
          tone.tonal[variant],
          text.high,
          className
        )}
      >
        {content}
        {onRemove && (
          <BaseButton
            type="button"
            aria-label={dismissLabel}
            onKeyDown={keepOwnKeys}
            onClick={onRemove}
            className={cn(
              /* The visible X is placed by the mark's own box, so the dismiss control's target padding —
                 the 6px of it on each side of a 16px glyph in this 28px target — is compensated at the
                 chip's end edge instead of reading as a trailing void. `size-7` plus `hitArea` keeps the
                 pointer target clear of the 24px minimum while the visible mark sits at the same edge
                 distance as the chip's leading content. */
              "group -me-1.5 inline-flex size-7 shrink-0 items-center justify-center",
              shape.circle,
              text.medium,
              "hover:text-sherick-ink",
              motionFeedback,
              focusRingInset,
              stateLayer.quiet,
              state.enabled,
              hitArea
            )}
          >
            {/* The target stays exactly where the pointer found it; the mark inside it carries the
                press. The dismiss control is a part of the chip the pointer is already in, so it
                clears the pointer-target minimum rather than the standalone target floor. */}
            <span className={cn("inline-flex items-center justify-center", motionInkPress)}>
              <X className={cn("size-4")} aria-hidden="true" />
            </span>
          </BaseButton>
        )}
      </span>
    );
  }
);

Chip.displayName = "Chip";

export default Chip;
