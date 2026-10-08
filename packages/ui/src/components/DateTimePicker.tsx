"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { CalendarClock } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import Button from "./Button";
import Calendar from "./Calendar";
import Field from "./Field";
import { edge, state } from "./ui.common";
import {
  DateCalendarPopup,
  DateFieldTrigger,
  dateFieldRowClassName,
  dateInputClassName,
  dateInputDirection,
  useDateFormReset,
} from "./date-field";
import {
  createTimeFormat,
  defaultCalendarLabels,
  minuteOfDay,
  normalizeCalendarDateTime,
  parseCalendarDateTime,
  resolveHourCycle,
  timeFromMinuteOfDay,
  toCalendarDateTime,
  type CalendarDate,
  type CalendarDateTime,
  type CalendarLabels,
} from "./date-family";
import { TimePanel, emptyTime, type PartialTime, type TimePanelLabels } from "./time-panel";

export type { CalendarDateTime } from "./date-family";

export interface DateTimePickerLabels extends CalendarLabels, TimePanelLabels {
  /** The action that closes the popup. */
  done: string;
  /** Reported when the entered date and time cannot be accepted. */
  unavailableDateTime: string;
}

const defaultDateTimeLabels: DateTimePickerLabels = {
  ...defaultCalendarLabels,
  time: "Time",
  hour: "Hour",
  minute: "Minute",
  period: "AM/PM",
  chooseTime: "Choose a time",
  done: "Done",
  unavailableDateTime: "That date and time is not available",
};

export interface DateTimePickerProps {
  /** The selected date and time, `YYYY-MM-DDTHH:mm`, or `null` for none. Undefined makes the picker
   *  uncontrolled. */
  value?: CalendarDateTime | null;
  defaultValue?: CalendarDateTime | null;
  /** Receives the next date and time, or `null` when the field is cleared. */
  onValueChange?: (value: CalendarDateTime | null) => void;
  /** The field's label. It names the native field, its control and the popup. */
  label: string;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Styles the field's own column. */
  className?: string;
  id?: string;
  /** The form that owns the field, when it renders outside it. */
  form?: string;
  /** Identifies the field when it is submitted. */
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: BasePopover.Root.Props["onOpenChange"];
  /** The earliest acceptable date and time, inclusive. */
  min?: CalendarDateTime;
  /** The latest acceptable date and time, inclusive. */
  max?: CalendarDateTime;
  /** Whether a date cannot be chosen at any time. Unavailable dates stay visible and are never selected. */
  isDateUnavailable?: (date: CalendarDate) => boolean;
  /** The interval, in minutes, between the minutes the popup offers. Typed entry stays
   *  minute-precise. Defaults to 5. */
  minuteStep?: number;
  /** Shows a twelve-hour clock with a day period, or a twenty-four-hour clock. Defaults to the
   *  locale's own. */
  hourCycle?: 12 | 24;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  today?: CalendarDate;
  labels?: Partial<DateTimePickerLabels>;
}

/* What the popup holds while it is being used. A date chosen before a time — or a time before a
   date — waits here rather than being committed with an invented other half. */
interface Selection {
  date: CalendarDate | null;
  time: PartialTime;
}

/**
 * A date and a time of day: a native `datetime-local` input, with a named control beside it that
 * opens the shared `Calendar` and a column for each part of the clock in a popover.
 *
 * The native input stays the field's control, so the browser owns its entry, its mobile UI, its
 * form submission and the `required` and `min`/`max` constraints; `isDateUnavailable` is reported
 * through the field's own validation, and a value the popup would refuse is never accepted — the
 * input keeps what was typed and the field says why. In the popup, a half-chosen value waits for
 * its other half, a choice that crosses a bound settles on the bound, and Done closes the surface.
 *
 * Values are civil `YYYY-MM-DDTHH:mm` readings with no time zone, exactly as the native input
 * submits them.
 */
const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(({
  value,
  defaultValue,
  onValueChange,
  label,
  description,
  error,
  required = false,
  disabled = false,
  className,
  id,
  form,
  name,
  open,
  defaultOpen,
  onOpenChange,
  min,
  max,
  isDateUnavailable,
  minuteStep = 5,
  hourCycle,
  locale = "en-US",
  weekStartsOn = 1,
  today,
  labels: labelsProp,
}, ref) => {
  const labels = useMemo(() => ({ ...defaultDateTimeLabels, ...labelsProp }), [labelsProp]);
  const timeFormat = useMemo(
    () => createTimeFormat(locale, hourCycle ?? resolveHourCycle(locale)),
    [locale, hourCycle]
  );
  const step = Number.isFinite(minuteStep) ? Math.min(60, Math.max(1, Math.round(minuteStep))) : 5;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<CalendarDateTime | null>(() =>
    normalizeCalendarDateTime(defaultValue)
  );
  const currentValue = isControlled ? normalizeCalendarDateTime(value) : internalValue;
  // Invalid native entry is an explicit draft, not a second writer of a valid controlled value.
  const [draft, setDraft] = useState<string | null>(null);
  const [pending, setPending] = useState<Selection | null>(null);
  const minValue = normalizeCalendarDateTime(min);
  const maxValue = normalizeCalendarDateTime(max);
  const minParts = parseCalendarDateTime(minValue);
  const maxParts = parseCalendarDateTime(maxValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fieldActionsRef = useRef<BaseField.Root.Actions | null>(null);

  useEffect(() => {
    setDraft(null);
    setPending(null);
  }, [currentValue]);
  useDateFormReset(inputRef, form, () => {
    const restored = isControlled ? currentValue : normalizeCalendarDateTime(defaultValue);
    setDraft(null);
    setPending(null);
    if (!isControlled) setInternalValue(restored);
    // Native reset has already run and emits no React change event.
    if (inputRef.current) inputRef.current.value = restored ?? "";
  });

  const commitValue = (next: CalendarDateTime | null) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const isSelectable = (candidate: CalendarDateTime) => {
    if (minValue && candidate < minValue) return false;
    if (maxValue && candidate > maxValue) return false;
    const parts = parseCalendarDateTime(candidate);
    return Boolean(parts) && !isDateUnavailable?.(parts!.date);
  };

  const displayText = draft ?? currentValue ?? "";
  const displayedValue = normalizeCalendarDateTime(displayText);
  const typedIssue = draft !== null || Boolean(
    displayText && (!displayedValue || !isSelectable(displayedValue))
  );
  const fieldInvalid = Boolean(error) || typedIssue;
  const validateValue = (candidate: unknown) => {
    if (draft !== null) return labels.unavailableDateTime;
    if (typeof candidate !== "string" || !candidate) return null;
    const parts = parseCalendarDateTime(candidate);
    return !parts || isDateUnavailable?.(parts.date) ? labels.unavailableDateTime : null;
  };

  // Constraints can change while the native text stays the same. Base remains the
  // validation owner; refresh its native custom validity as well as the field's visuals.
  useEffect(() => {
    fieldActionsRef.current?.validate();
  }, [displayText, typedIssue, minValue, maxValue, isDateUnavailable, disabled, labels.unavailableDateTime]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const next = normalizeCalendarDateTime(input.value);
    if (input.validity.badInput || (input.value && (!next || !isSelectable(next)))) {
      setDraft(input.value);
      return;
    }
    setDraft(null);
    setPending(null);
    commitValue(next);
  };

  const boundsOn = (date: CalendarDate | null) => ({
    min: minParts && date === minParts.date ? minuteOfDay(minParts.time) : null,
    max: maxParts && date === maxParts.date ? minuteOfDay(maxParts.time) : null,
  });

  /* Whether any reading on a day is acceptable: the calendar's own rule, and a day whose bounds
     leave room between them. */
  const dayIsAcceptable = (date: CalendarDate) => {
    if (minParts && date < minParts.date) return false;
    if (maxParts && date > maxParts.date) return false;
    if (isDateUnavailable?.(date)) return false;
    const bounds = boundsOn(date);
    return bounds.min === null || bounds.max === null || bounds.min <= bounds.max;
  };

  /* The popup works on the committed value, or on a half-chosen one waiting for its other half. A
     held day the constraints refuse — a value from before they changed, or one the application
     passed in — anchors nothing: the calendar shows no selection, and a reading waits for a day. */
  const committed = parseCalendarDateTime(currentValue);
  const held: Selection = pending ?? {
    date: committed?.date ?? null,
    time: committed ? { ...committed.time, afternoon: committed.time.hour >= 12 } : emptyTime,
  };
  const selection: Selection = { ...held, date: held.date && dayIsAcceptable(held.date) ? held.date : null };

  const choose = (next: Selection) => {
    if (disabled) return;
    setDraft(null);
    const { date, time } = next;
    if (!date || time.hour === null || time.minute === null) {
      setPending(next);
      return;
    }
    /* A day with a bound on it can make the held reading unacceptable; it settles on the bound. */
    const bounds = boundsOn(date);
    const reading = minuteOfDay({ hour: time.hour, minute: time.minute });
    const minutes = Math.min(bounds.max ?? Infinity, Math.max(bounds.min ?? -Infinity, reading));
    const candidate = toCalendarDateTime(date, timeFromMinuteOfDay(minutes));
    /* The popup never commits what the field would refuse. */
    if (!isSelectable(candidate)) {
      setPending({ date: null, time });
      return;
    }
    setPending(null);
    commitValue(candidate);
  };

  const dayBounds = boundsOn(selection.date);

  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      /* Non-modal: the field, the page and the browser's own entry all stay reachable while the
         popup is open. */
      modal={false}
    >
      <Field
        label={label}
        description={description}
        error={error || (typedIssue ? labels.unavailableDateTime : undefined)}
        required={required}
        disabled={disabled}
        invalid={typedIssue}
        validate={validateValue}
        validationMode="onChange"
        actionsRef={fieldActionsRef}
        className={cn(disabled && state.disabled, className)}
      >
        <div
          data-disabled={disabled || undefined}
          data-invalid={fieldInvalid || undefined}
          className={cn(dateFieldRowClassName(disabled))}
        >
          <div dir={dateInputDirection} className={cn("min-w-0 flex-1 overflow-hidden")}>
            <BaseField.Control
              ref={ref}
              render={<input type="datetime-local" ref={inputRef} />}
              id={id}
              name={name}
              form={form}
              required={required}
              disabled={disabled}
              min={minValue ?? undefined}
              max={maxValue ?? undefined}
              value={displayText}
              onChange={handleInputChange}
              className={cn(dateInputClassName)}
            />
          </div>
          <DateFieldTrigger
            label={`Open ${label}`}
            disabled={disabled}
            icon={<CalendarClock aria-hidden="true" />}
          />
        </div>
      </Field>

      {/* The popup sits outside the field, so nothing in it can register with the field the
          native input owns. */}
      <DateCalendarPopup
        title={label}
        anchor={() => inputRef.current?.parentElement?.parentElement ?? null}
        className={cn("max-w-[min(34rem,var(--available-width))]")}
      >
        {/* Side by side where there is room, the time beneath the month on a narrow screen. Beside
            the calendar the panel takes no height of its own, so the month decides the popup's
            height and the columns scroll within it. */}
        <div className={cn("flex flex-col sm:grid sm:grid-cols-[auto_auto]")}>
          <Calendar
            mode="single"
            value={selection.date}
            onValueChange={(date) => {
              if (date) choose({ date, time: selection.time });
            }}
            disabled={disabled}
            min={minParts?.date}
            max={maxParts?.date}
            isDateUnavailable={isDateUnavailable}
            locale={locale}
            weekStartsOn={weekStartsOn}
            today={today}
            labels={labelsProp}
            className={cn("shrink-0")}
          />
          <TimePanel
            time={selection.time}
            onTimeChange={(time) => choose({ date: selection.date, time })}
            minMinute={dayBounds.min}
            maxMinute={dayBounds.max}
            format={timeFormat}
            minuteStep={step}
            labels={labels}
            disabled={disabled}
            className={cn(
              "mt-3 border-t pt-3 sm:ms-3 sm:mt-0 sm:h-0 sm:min-h-full sm:border-s sm:border-t-0 sm:ps-3 sm:pt-0",
              edge.rule,
              disabled && state.disabled
            )}
            footer={
              <BasePopover.Close
                disabled={disabled}
                render={(props) => (
                  <Button {...props} size="sm" disabled={disabled}>
                    {labels.done}
                  </Button>
                )}
              />
            }
          />
        </div>
      </DateCalendarPopup>
    </BasePopover.Root>
  );
});

DateTimePicker.displayName = "DateTimePicker";

export default DateTimePicker;
