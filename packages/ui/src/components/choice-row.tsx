"use client";

import { Field } from "@base-ui/react/field";
import type { ClassValue } from "clsx";
import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingWithin,
  material,
  selectableRowSupporting,
  selectableRowSurface,
  shape,
  state,
  stateLayerQuietComposite,
  text,
  type,
} from "./ui.common";
import { motionFeedback } from "./ui.motion";

/* The row a choice in a group sits on — a radio in `RadioGroup`, a checkbox in `CheckboxGroup`. The
   two groups hold different marks and different values, but a choice is the same object in both: the
   whole row is its label, the mark holds the first line of the copy, and the opt-in `surface` row is
   the same held-choice surface. One anatomy keeps the two from drifting into two designs. */

export type ChoiceAppearance = "default" | "surface";

/* Each part is a class list rather than a finished class name: the component composes it through its
   own `cn()`, which is what scopes it. */

/** The `Field.Item` that scopes one choice's label and description. */
export const choiceItemClasses = (appearance: ChoiceAppearance): ClassValue[] => [
  "group flex items-stretch",
  density.normal,
  appearance === "surface" &&
    cn(
      "relative min-w-0 forced-colors:has-[:focus-visible]:[outline-style:none]",
      shape.control,
      material.matteQuiet,
      selectableRowSurface,
      stateLayerQuietComposite,
      focusRingWithin,
      motionFeedback
    ),
  state.enabled,
  state.effectiveDisabled,
  state.disabledRow,
];

/* The row itself is the label, so the whole row stays the pointer target. Inside it the mark and the
   copy are one first-line group: a wrapped label then aligns the mark to its first line instead of
   centring it on the block, while a one-line row is still centred in the row's own density height.
   The copy declares its own line height — `density.normal` sets the type step but no leading, and this
   package ships no reset — so the 20px mark plus its 2px of block margin and the line it is centred on
   are the same 24px whatever line height a host happens to inherit. */
export const choiceLabelClasses = (appearance: ChoiceAppearance): ClassValue[] => [
  "flex min-w-0 flex-1 items-center",
  appearance === "surface" && "px-4 py-3",
];

export const choiceLineClassName = "flex w-full items-start gap-3";

interface ChoiceCopyProps {
  appearance: ChoiceAppearance;
  label: ReactNode;
  description?: ReactNode;
  /** The id the control is named by when a description follows its label. */
  labelId: string;
}

/**
 * A choice's copy. Without a description it is the label alone, and the control is named by the
 * whole row. With one, the label is the name and the description is the control's description:
 * Base links it through the `Field.Item` around the row, so a reader hears "Casino A, checkbox,
 * casino-a.com and casino-a.net" rather than one run-on name. Both stay inside the row, so a press
 * on the supporting line still makes the choice.
 */
export function ChoiceCopy({ appearance, label, description, labelId }: ChoiceCopyProps) {
  if (description == null) {
    return <span className={cn(text.high, "min-w-0 leading-6", appearance === "surface" && "flex-1")}>{label}</span>;
  }
  return (
    <span className={cn("flex min-w-0 flex-col", appearance === "surface" && "flex-1")}>
      <span id={labelId} className={cn(text.high, "leading-6")}>{label}</span>
      {/* A label holds phrasing content only, so the description renders as a span. */}
      <Field.Description
        render={<span />}
        className={cn("mt-0.5 block", type.supporting, text.medium, appearance === "surface" && selectableRowSupporting)}
      >
        {description}
      </Field.Description>
    </span>
  );
}
