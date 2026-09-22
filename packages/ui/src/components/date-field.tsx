"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { CalendarDays } from "lucide-react";
import React, { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { density, focusRingWithin, material, overlay, shape, stacking, state, stateLayer, text } from "./ui.common";
import { motionFeedback, motionInkPress, motionPresenceAnchored } from "./ui.motion";

/* The parts the two date pickers share.
   ====================================
   A picker is a native `type=date` field with a named control beside it that opens the calendar,
   so the field's surface, its trailing control and the popup that holds the grid have to be one
   definition rather than two that drift. This module is private to the date family: nothing here
   is published, and neither picker adds a shell of its own.

   `DatePicker` and `DateRangePicker` compose Base `Field` for the label/description/error
   relationship and Base `Popover` for the popup; what lives here is only the visual and
   structural arrangement those compositions hold in common. */

/**
 * The one field surface the date family uses: a borderless matte field whose focus treatment
 * wraps the whole row, exactly as the library's other composite fields do.
 *
 * The row carries `group/field` and its own `data-disabled` marker so the trailing control's dim
 * is neutralised inside an already dimmed field — a disabled field dims once, at the field.
 */
export const dateFieldRowClassName = (disabled: boolean) =>
  cn(
    "group/field flex min-w-0 w-full items-center ps-5 pe-3",
    density.normal,
    shape.control,
    material.control,
    motionFeedback,
    focusRingWithin,
    state.field.invalid,
    !disabled && state.field.hover,
    !disabled && state.field.focusWithin,
    !disabled && state.field.invalidHover,
    !disabled && state.field.invalidFocusWithin,
    disabled ? state.disabledDescendant : state.text
  );

/** Native date entry remains intact. Its trailing browser affordance sits outside the clipped
 *  input slot, leaving one visible calendar trigger in every engine (Firefox does not expose
 *  a picker-indicator pseudo-element). The composite row owns focus, not the clipped input. */
export const dateInputClassName =
  "block w-[calc(100%+2.5rem)] min-w-0 bg-transparent py-3 text-inherit outline-none disabled:cursor-not-allowed";

/* The 36×44 target holds a concentric 32px hover surface, leaving air inside the 48px field.
   Only the icon presses: the adjacent native text entry never activates this button. */
const datePartClassName = `group inline-flex shrink-0 items-center justify-center ${density.part} ${shape.circle} ${text.medium} ${motionFeedback} ${stateLayer.quiet} before:inset-x-0.5 before:inset-y-1.5 ${state.enabled} ${state.disabledPart} [&:not([data-disabled]):not(:disabled)]:hover:text-sherick-ink`;

export interface DateFieldTriggerProps {
  /** The control's accessible name. It has no visible label, so it has to be named. */
  label: string;
  disabled?: boolean;
}

/**
 * The named control that opens the calendar. It is a Base `Popover.Trigger` rendered as a native
 * button, so Base owns the relationship it publishes on the field (`aria-haspopup`,
 * `aria-expanded`, `aria-controls`) and the pointer and keyboard activation that opens the
 * surface; the button itself only carries the type it needs to stay out of form submission.
 */
export const DateFieldTrigger = ({ label, disabled = false }: DateFieldTriggerProps) => (
  <BasePopover.Trigger
    disabled={disabled}
    render={<button type="button" aria-label={label} disabled={disabled} className={cn(datePartClassName)} />}
  >
    <span className={cn("inline-flex size-5 items-center justify-center [&>svg]:size-5", !disabled && motionInkPress)}>
      <CalendarDays aria-hidden="true" />
    </span>
  </BasePopover.Trigger>
);

export interface DateCalendarPopupProps {
  /** Names the popup, through Base's own Title part. */
  title: string;
  children: ReactNode;
  anchor: React.ComponentProps<typeof BasePopover.Positioner>["anchor"];
}

/**
 * The calendar's popup: the same shell `Popover.Content` renders, composed straight from Base's
 * public parts because the grid needs one thing the published shell does not offer — `initialFocus`
 * aimed at the day the reader is on, so the grid is usable from the moment it opens.
 *
 * Base owns the portal, the placement and collision handling, the outside-interaction and Escape
 * dismissal and the focus restoration; the surface is non-modal, so the rest of the page stays
 * reachable. Sherick owns only the sheet and its presence.
 */
export const DateCalendarPopup = ({ title, children, anchor }: DateCalendarPopupProps) => {
  const popupRef = useRef<HTMLDivElement | null>(null);

  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        anchor={anchor}
        side="bottom"
        align="start"
        sideOffset={8}
        className={cn(stacking.float)}
      >
        <BasePopover.Popup
          ref={popupRef}
          /* The roving tab stop is the calendar's own active day, so this is exactly the cell a
             keyboard reader would land on. `null` leaves Base's default focus behaviour in place
             if the grid has no tab stop to give. */
          initialFocus={() =>
            popupRef.current?.querySelector<HTMLElement>('[data-day][tabindex="0"]') ?? null
          }
          className={cn(
            "w-max max-w-[min(24rem,var(--available-width))] max-h-[var(--available-height)] overflow-y-auto p-3 [overflow-wrap:anywhere]",
            overlay.popup,
            motionPresenceAnchored
          )}
        >
          <BasePopover.Title className={cn("sr-only")}>{title}</BasePopover.Title>
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
};

/** Base Field controls entry and validity, but native reset emits no input/change event.
 * Bridge only the date family's domain state, after the owning form's cancelable reset. */
export const useDateFormReset = (
  inputRef: React.RefObject<HTMLInputElement | null>,
  formId: string | undefined,
  restore: () => void
) => {
  const latestRestore = useRef(restore);
  useEffect(() => { latestRestore.current = restore; }, [restore]);
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const reset = (event: Event) => {
      // A microtask can run between native listeners, before React's delegated onReset.
      // The next task observes cancellation after the entire native dispatch/default action.
      setTimeout(() => {
        if (!event.defaultPrevented && inputRef.current?.form === form) latestRestore.current();
      }, 0);
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [inputRef, formId]);
};
