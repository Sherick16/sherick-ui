"use client";

import React from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Alert02Icon, CancelCircleIcon, CheckmarkCircle02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/libs/utils";
import { iconSlot, iconStroke, tone } from "./ui.common";
import type { Variant } from "./ui.types";

/*
 * The one map from a status to its glyph. An Alert and a Toast both report a status, so both take
 * their mark from here: a variant has one silhouette, and a neutral information line is still the
 * circled information mark in the accent. Warning is the triangle in every feedback surface (§13).
 */
const glyphs: Record<Variant, IconSvgElement> = {
  primary: InformationCircleIcon,
  secondary: InformationCircleIcon,
  danger: CancelCircleIcon,
  warning: Alert02Icon,
  success: CheckmarkCircle02Icon,
};

/* The information mark stays in the accent whatever the surface is, so a neutral alert's only
   colour is the one thing that says "information" (§10). */
const tones: Record<Variant, string> = {
  primary: tone.text.primary,
  secondary: tone.text.primary,
  danger: tone.text.danger,
  warning: tone.text.warning,
  success: tone.text.success,
};

export interface StatusMarkProps {
  variant: Variant;
  className?: string;
}

/*
 * The mark is the normal icon slot (20px): an Alert's status is a first-line mark beside 14px copy,
 * the exception §13 records, and a Toast's mark is the same 20px. The slot is the only sizing source,
 * so the caller places the mark and never sizes it.
 */
export const StatusMark = ({ variant, className }: StatusMarkProps) => (
  <span className={cn(iconSlot.normal, className)} aria-hidden="true">
    <HugeiconsIcon icon={glyphs[variant]} aria-hidden="true" className={cn(iconStroke.glyph, tones[variant])} />
  </span>
);

StatusMark.displayName = "StatusMark";

export default StatusMark;
