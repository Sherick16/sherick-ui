"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { elevation, focusRingInset, shape, state, stateLayer, text, tone, type } from "./ui.common";
import { motionFeedback } from "./ui.motion";
import type { TimeFormat } from "./date-family";

/* The time half of the date family.
   ================================
   A clock reading chosen from columns — hour, minute and, on a twelve-hour clock, the day period —
   that sits beside the calendar in `DateTimePicker`'s popup. Each column is a Base `RadioGroup`:
   one value out of a short list is exactly what a radio group is, so Base owns the roving tab stop,
   the arrow keys (which select as they move, as radios do), skipping options that cannot be chosen,
   and keeping the checked option scrolled into its own column. Every column sits in its own Base
   `Field.Root` so its caption is its accessible name and the picker's field — whose control is the
   native input — is never mistaken for the column's. This module is private to the date family. */

const UNBOUNDED_MIN = 0;
const UNBOUNDED_MAX = 23 * 60 + 59;
const NOON = 12 * 60;

/** A reading as far as it has been chosen. An hour completes it — an empty minute reads `:00` —
 *  while a minute or a day period chosen first waits for its hour rather than inventing one. */
export interface PartialTime {
  hour: number | null;
  minute: number | null;
  /** The day period chosen before an hour, on a twelve-hour clock. */
  afternoon: boolean | null;
}

export const emptyTime: PartialTime = { hour: null, minute: null, afternoon: null };

/* A held reading is the same shallow held surface as a calendar day or a list option; a row answers
   the pointer with tone, never compression. The column sits inside a `surface` sheet behind a 12px
   inset, so its rows take the nested `row` corner. */
const optionClassName =
  `relative flex h-10 w-full shrink-0 select-none items-center justify-center text-sm outline-none ${type.numeric} ${shape.row} ${text.high} ${motionFeedback} ${focusRingInset}`;

interface TimeOption<Value> {
  value: Value;
  label: string;
  disabled: boolean;
}

interface TimeColumnProps<Value extends string | number> {
  label: string;
  value: Value | null;
  options: TimeOption<Value>[];
  onValueChange: (value: Value) => void;
  disabled: boolean;
}

function TimeColumn<Value extends string | number>({
  label,
  value,
  options,
  onValueChange,
  disabled,
}: TimeColumnProps<Value>) {
  /* The column opens with its held reading in the middle, its neighbours visible on both sides.
     This is placement, not navigation: it runs when the column mounts, and from then on Base keeps
     the checked option in view as the keys move it. */
  const centerHeldReading = useCallback((list: HTMLDivElement | null) => {
    const held = list?.querySelector<HTMLElement>("[data-checked]");
    if (list && held) list.scrollTop = held.offsetTop - (list.clientHeight - held.offsetHeight) / 2;
  }, []);

  /* Base seats a radio group's tab stop on the checked option once, when its options mount. When
     this column's reading changes from outside it — a bound settling the minute, a day in the
     calendar, an entry typed into the field — the group is mounted afresh, so the tab stop and the
     scroll position follow the reading instead of resting on the option that used to hold it. A
     change the column made itself keeps the group, and the focus inside it. */
  const emitted = useRef(value);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    setGeneration((current) => current + 1);
  }, [value]);

  return (
    <BaseField.Root disabled={disabled} className={cn("flex min-h-0 min-w-0 flex-1 flex-col sm:w-14 sm:flex-none")}>
      <BaseField.Label
        className={cn("flex h-8 shrink-0 items-center justify-center font-medium", type.caption, text.medium)}
      >
        {label}
      </BaseField.Label>
      <BaseRadioGroup<Value | null>
        key={generation}
        ref={centerHeldReading}
        /* `null` keeps the group controlled while no reading has been chosen yet. */
        value={value}
        onValueChange={(next) => {
          if (next === null) return;
          emitted.current = next;
          onValueChange(next);
        }}
        disabled={disabled}
        /* The column is its own scroll container, which is what lets Base keep the checked option in
           view. The scroll padding leaves a neighbour visible on either side of it. */
        className={cn(
          "relative flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-1 scroll-py-11 [scrollbar-width:thin]"
        )}
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            /* Each option scopes its own label context, so it is named by its reading rather than
               inheriting the column's caption — every hour would otherwise announce as "Hour". */
            <BaseField.Item key={option.value} className={cn("contents")}>
              <Radio.Root
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  optionClassName,
                  checked && cn("font-medium", tone.selected.primary, elevation.control),
                  disabled ? state.disabledDescendant : cn(stateLayer.quiet, state.enabled, state.effectiveDisabled)
                )}
              >
                {option.label}
              </Radio.Root>
            </BaseField.Item>
          );
        })}
      </BaseRadioGroup>
    </BaseField.Root>
  );
}

export interface TimePanelLabels {
  /** Names the panel's group of columns. */
  time: string;
  hour: string;
  minute: string;
  period: string;
  /** Shown in place of the reading until one is chosen. */
  chooseTime: string;
}

export interface TimePanelProps {
  /** The reading on the panel, as far as it has been chosen. */
  time: PartialTime;
  onTimeChange: (time: PartialTime) => void;
  /** The earliest acceptable reading on the chosen day, in minutes since midnight. */
  minMinute: number | null;
  /** The latest acceptable reading on the chosen day, in minutes since midnight. */
  maxMinute: number | null;
  format: TimeFormat;
  /** The interval between the minutes the column offers. */
  minuteStep: number;
  labels: TimePanelLabels;
  disabled: boolean;
  /** The panel's closing row. */
  footer?: ReactNode;
  className?: string;
}

/**
 * A clock reading in columns. Readings outside the chosen day's bounds stay listed and are refused,
 * like an unavailable calendar day; a choice that would cross a bound — an hour whose current
 * minute is too early, a period that flips past the limit — settles on the bound instead, so the
 * panel can never produce a reading the field would reject.
 */
export const TimePanel = ({
  time,
  onTimeChange,
  minMinute,
  maxMinute,
  format,
  minuteStep,
  labels,
  disabled,
  footer,
  className,
}: TimePanelProps) => {
  const lower = minMinute ?? UNBOUNDED_MIN;
  const upper = maxMinute ?? UNBOUNDED_MAX;
  const { hour, minute } = time;
  /* Only a complete reading is settled on a bound; a partial one is only offered what fits. */
  const complete = (nextHour: number, nextMinute: number): PartialTime => {
    const minutes = Math.min(upper, Math.max(lower, nextHour * 60 + nextMinute));
    const settled = Math.floor(minutes / 60);
    return { hour: settled, minute: minutes % 60, afternoon: settled >= 12 };
  };

  const twelveHour = format.hourCycle === 12;
  /* With no hour held, the column lists the period already chosen, or else the first one that has a
     reading the day accepts. */
  const afternoon = hour !== null ? hour >= 12 : time.afternoon ?? lower >= NOON;

  /* A twelve-hour column lists the hours of the period on screen, so its values stay real hours. */
  const firstHour = twelveHour && afternoon ? 12 : 0;
  const hourOptions: TimeOption<number>[] = Array.from({ length: twelveHour ? 12 : 24 }, (_, index) => {
    const value = firstHour + index;
    /* An hour is refused only when no minute in it is acceptable; a held minute that does not fit
       the hour settles on the bound instead. */
    return { value, label: format.formatHour(value), disabled: value * 60 + 59 < lower || value * 60 > upper };
  });

  /* The column offers the step, and always the minute already held, so an off-step value typed into
     the field still reads as selected here. */
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, index) => index * minuteStep);
  if (minute !== null && !minutes.includes(minute)) {
    minutes.push(minute);
    minutes.sort((left, right) => left - right);
  }
  const minuteOptions: TimeOption<number>[] = minutes.map((value) => ({
    value,
    label: format.formatMinute(value),
    disabled:
      hour !== null
        ? hour * 60 + value < lower || hour * 60 + value > upper
        : /* Before an hour, a minute is refused only when no hour of the day could take it. */
          Math.ceil((lower - value) / 60) * 60 + value > upper,
  }));

  const periodOptions: TimeOption<"am" | "pm">[] = [
    { value: "am", label: format.periodNames[0], disabled: lower >= NOON },
    { value: "pm", label: format.periodNames[1], disabled: upper < NOON },
  ];

  return (
    <div role="group" aria-label={labels.time} className={cn("flex min-w-0 flex-col", className)}>
      {/* The reading, where the calendar writes its month: the two halves of the popup read across. */}
      <div
        className={cn(
          "mb-2 flex min-h-11 items-center justify-center truncate text-center text-sm font-medium",
          type.numeric,
          hour !== null ? text.high : text.medium
        )}
      >
        {hour !== null ? format.formatTime({ hour, minute: minute ?? 0 }) : labels.chooseTime}
      </div>

      <div className={cn("flex h-48 min-h-0 gap-1 sm:h-auto sm:flex-1")}>
        <TimeColumn
          label={labels.hour}
          value={hour}
          options={hourOptions}
          onValueChange={(next) => onTimeChange(complete(next, minute ?? 0))}
          disabled={disabled}
        />
        <TimeColumn
          label={labels.minute}
          value={minute}
          options={minuteOptions}
          onValueChange={(next) =>
            onTimeChange(hour !== null ? complete(hour, next) : { ...time, minute: next })
          }
          disabled={disabled}
        />
        {twelveHour && (
          <TimeColumn
            label={labels.period}
            value={hour !== null || time.afternoon !== null ? (afternoon ? "pm" : "am") : null}
            options={periodOptions}
            onValueChange={(next) =>
              onTimeChange(
                hour !== null
                  ? complete((hour % 12) + (next === "pm" ? 12 : 0), minute ?? 0)
                  : { ...time, afternoon: next === "pm" }
              )
            }
            disabled={disabled}
          />
        )}
      </div>

      {footer && <div className={cn("mt-3 flex items-center justify-end gap-3")}>{footer}</div>}
    </div>
  );
};
