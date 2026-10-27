"use client";

import { Toggle } from "@base-ui/react/toggle";
import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import { density, elevation, focusRing, hitArea, iconSlot, shape, state, stateLayer, text, tone } from "./ui.common";
import { motionTactile } from "./ui.motion";
import { Variant } from "./ui.types";
import DismissButton from "./DismissButton";
import { focusNeighbour } from "./Alert";

/** The parts every chip has, whichever of its two forms it takes. */
interface ChipAnatomy {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
}

/**
 * A toggle chip holds a selection. Supplying any of `checked`, `defaultChecked`, `onCheckedChange` or
 * `value` makes it a toggle button, and it takes the props of one; inside a `ChipGroup` the group owns
 * the value, exactly as it does for any grouped control.
 */
export type ChipToggleProps = ChipAnatomy &
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
  };

/**
 * A tag holds no selection and may be dismissed. It is a span, so it has no button role; its only
 * control is the dismiss, which is what `onRemove` renders. A tag is `Chip.Tag`, or a `Chip` with
 * `onRemove` and no value.
 */
export type ChipTagProps = ChipAnatomy &
  HTMLAttributes<HTMLSpanElement> & {
    /** Renders a dismiss control. */
    onRemove?: () => void;
    /**
     * The dismiss control's accessible name. Defaults to `Remove <text>` when the chip's children are a
     * string, and to `Remove` otherwise.
     */
    removeLabel?: string;
    /** A tag holds nothing to select. */
    checked?: never;
    defaultChecked?: never;
    onCheckedChange?: never;
    value?: never;
    disabled?: never;
  };

/**
 * A chip is one of two things, and never both. A toggle is a `<button>`, and a tag is a `<span>`
 * containing its dismiss control: a button cannot legally nest inside a button, and a control that both
 * holds a value and deletes itself is one target with two meanings.
 */
export type ChipProps = ChipToggleProps | ChipTagProps;

const isToggle = (props: ChipProps): props is ChipToggleProps =>
  props.value !== undefined ||
  props.checked !== undefined ||
  props.defaultChecked !== undefined ||
  props.onCheckedChange !== undefined;

const dismissLabelFor = (children: ReactNode, removeLabel?: string) =>
  removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");

/* The icon and the label, whichever form the chip takes. A tag's icon carries the variant's tone, while a
   toggle's keeps the ink of its own state. */
const chipContent = (children: ReactNode, icon: ReactNode, variant: Variant, inTag: boolean) => (
  <>
    {icon && (
      <span className={cn(iconSlot.compact, inTag && tone.text[variant])} aria-hidden="true">
        {icon}
      </span>
    )}
    <span className={cn("min-w-0 truncate")}>{children}</span>
  </>
);

/*
 * A tag: passive, dismissible and flat. Its copy keeps its normal emphasis and its icon carries the
 * semantic tone, and its dismiss is the only control it owns. The dismiss is a 44px target like every
 * dismiss (§13), so only its 16px mark is compact: the target is pulled back at the chip's end edge
 * until the mark sits at the chip's own 16px inset, and it is not allowed to add a trailing void.
 */
const ChipTag = forwardRef<HTMLElement, ChipTagProps>(
  ({ children, variant = "primary", icon, onRemove, removeLabel, className, ...tagProps }, ref) => (
    <span
      {...tagProps}
      ref={ref}
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-1.5 px-4 py-1.5 font-medium",
        density.compact,
        shape.pill,
        tone.tonal[variant],
        text.high,
        className
      )}
    >
      {chipContent(children, icon, variant, true)}
      {onRemove && (
        <DismissButton
          label={dismissLabelFor(children, removeLabel)}
          size="compact"
          inRow
          /* Inside a 40px chip the dismiss keeps its 28px visible circle and reaches the 44px target
             through `hitArea`, so the chip keeps its height and the inset ring stays inside it. The
             6px either side of the 16px mark is compensated at the chip's end edge. */
          className={cn("-me-1.5 size-7 min-h-7 min-w-7", hitArea)}
          /* A tag's dismiss is not one of a group's items, so the keys aimed at it are its own. The
             composite root answers Arrow, Home and End for its items in the bubble phase, and without
             this its roving navigation would take focus away from the control the reader is on. */
          onKeyDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            /* The dismiss is a direct child of its tag, so the tag is the node that is leaving. */
            if (event.currentTarget.parentElement) focusNeighbour(event.currentTarget.parentElement);
            onRemove();
          }}
        />
      )}
    </span>
  )
);

ChipTag.displayName = "Chip.Tag";

/**
 * A compact control-sized object: a toggle button that holds a selection, or a tag that carries its tone
 * in its fill and can be dismissed. A toggle is raised and tactile because it is manipulated, and a tag
 * is flat because it is only read. The ref points at the chip's own element: the button or the tag's span.
 */
const ChipRoot = forwardRef<HTMLElement, ChipProps>((props, ref) => {
  /* One ref for two elements: whichever one the chip turned out to be is what a caller means by "the chip".
     A callback ref is what keeps a hook-free component free of a conditional hook. */
  const setRef = (node: HTMLElement | null) => {
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  if (!isToggle(props)) return <ChipTag {...props} ref={setRef} />;

  const {
    children,
    variant = "primary",
    icon,
    checked,
    defaultChecked,
    onCheckedChange,
    value,
    className,
    disabled,
    ...toggleProps
  } = props;

  return (
    <Toggle
      {...toggleProps}
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
          shape.pill,
          motionTactile,
          focusRing,
          state.enabled,
          state.effectiveDisabled,
          /* Selection is a tone the chip takes, never a depth: the rest fill is the neutral matte control
             step and the variant names the tone of the held state, exactly as a segment inside its track
             and a switch inside its groove resolve it. The two fills are alternatives rather than a stack —
             written as a stack, the rest step is the last background in the list and `tailwind-merge` would
             keep it, leaving a held chip neutral. */
          toggleState.pressed
            ? tone.selected[variant]
            : cn(
                tone.tonal.secondary,
                text.medium,
                !toggleState.disabled && "hover:text-sherick-ink"
              ),
          !toggleState.disabled && (toggleState.pressed ? stateLayer.tonal : stateLayer.tonalNeutral),
          elevation.raised,
          !toggleState.disabled && state.recess,
          className
        )
      }
    >
      {chipContent(children, icon, variant, false)}
    </Toggle>
  );
});

ChipRoot.displayName = "Chip";

/* `Chip.Tag` is the passive form on its own, so a tag reads as a tag at the call site and a toggle can never
   be written where a tag was meant. A `Chip` with `onRemove` and no value is the same tag. */
export const Chip = Object.assign(ChipRoot, { Tag: ChipTag });

export default Chip;
